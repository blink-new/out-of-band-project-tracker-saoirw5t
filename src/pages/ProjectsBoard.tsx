import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  Edit,
  Trash2
} from 'lucide-react'
import Layout from '../components/Layout'
import { User as UserType, Project } from '../types'
import { getBusinessProjects, createProject, updateProject, deleteProject, convertProjectToFrontend } from '../lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

interface ProjectsBoardProps {
  user: UserType
}

// Mock data - in real app this would come from the database
const mockProjects: Project[] = [
  {
    id: '1',
    projectName: 'Customer Portal Enhancement',
    projectDescription: 'Improve the customer self-service portal with new features',
    status: 'in_progress',
    effortLevel: 'high',
    timeCommitmentPerWeek: 15,
    projectOwner: 'John Smith',
    targetCompletionDate: '2024-08-15',
    businessId: 'business-1',
    createdBy: 'user-1',
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    risksBlockers: 'API integration delays'
  },
  {
    id: '2',
    projectName: 'Support Ticket Automation',
    projectDescription: 'Automate common support ticket responses',
    status: 'review',
    effortLevel: 'medium',
    timeCommitmentPerWeek: 8,
    projectOwner: 'Sarah Johnson',
    targetCompletionDate: '2024-07-30',
    businessId: 'business-1',
    createdBy: 'user-2',
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-07-14T16:45:00Z'
  },
  {
    id: '3',
    projectName: 'Knowledge Base Restructure',
    projectDescription: 'Reorganize and update the internal knowledge base',
    status: 'todo',
    effortLevel: 'low',
    timeCommitmentPerWeek: 5,
    projectOwner: 'Mike Davis',
    targetCompletionDate: '2024-09-01',
    businessId: 'business-1',
    createdBy: 'user-3',
    createdAt: '2024-07-10T11:00:00Z',
    updatedAt: '2024-07-10T11:00:00Z'
  },
  {
    id: '4',
    projectName: 'Mobile App Bug Fixes',
    projectDescription: 'Fix critical bugs in the mobile application',
    status: 'completed',
    effortLevel: 'high',
    timeCommitmentPerWeek: 20,
    projectOwner: 'Lisa Chen',
    targetCompletionDate: '2024-07-10',
    businessId: 'business-1',
    createdBy: 'user-4',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-07-10T17:00:00Z'
  }
]

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-amber-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' }
]

const effortLevelConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' }
}

export default function ProjectsBoard({ user }: ProjectsBoardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    status: 'todo',
    effortLevel: 'medium'
  })

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const dbProjects = await getBusinessProjects(user.businessId)
        const frontendProjects = dbProjects.map(convertProjectToFrontend)
        setProjects(frontendProjects)
      } catch (error) {
        console.error('Error loading projects:', error)
        // Fallback to mock data
        setProjects(mockProjects)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user.businessId])

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectOwner?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const projectsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredProjects.filter(project => project.status === column.id)
    return acc
  }, {} as Record<string, Project[]>)

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = projectsByStatus[source.droppableId]
      const newColumn = Array.from(column)
      const [removed] = newColumn.splice(source.index, 1)
      newColumn.splice(destination.index, 0, removed)
      
      // Update the projects array to maintain the new order
      setProjects(prev => prev.map(p => {
        if (p.id === draggableId) {
          return { ...p, updatedAt: new Date().toISOString() }
        }
        return p
      }))
    } else {
      // Moving between columns
      const newStatus = destination.droppableId as Project['status']
      
      // Update in database
      try {
        await updateProject(draggableId, { status: newStatus })
      } catch (error) {
        console.error('Error updating project status:', error)
      }
      
      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === draggableId 
          ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
          : project
      ))
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.projectName) return

    try {
      const projectId = await createProject({
        projectName: newProject.projectName,
        projectDescription: newProject.projectDescription,
        status: newProject.status || 'todo',
        effortLevel: newProject.effortLevel || 'medium',
        timeCommitmentPerWeek: newProject.timeCommitmentPerWeek,
        projectOwner: newProject.projectOwner,
        targetCompletionDate: newProject.targetCompletionDate,
        businessId: user.businessId,
        createdBy: user.id
      })

      const project: Project = {
        id: projectId,
        projectName: newProject.projectName,
        projectDescription: newProject.projectDescription,
        status: newProject.status as Project['status'] || 'todo',
        effortLevel: newProject.effortLevel as Project['effortLevel'] || 'medium',
        timeCommitmentPerWeek: newProject.timeCommitmentPerWeek,
        projectOwner: newProject.projectOwner,
        targetCompletionDate: newProject.targetCompletionDate,
        businessId: user.businessId,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setProjects(prev => [...prev, project])
      setNewProject({ status: 'todo', effortLevel: 'medium' })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const isOverdue = (project: Project) => {
    if (!project.targetCompletionDate || project.status === 'completed') return false
    return new Date(project.targetCompletionDate) < new Date()
  }

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects Board</h1>
            <p className="text-gray-600 mt-1">Drag and drop projects to update their status</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Project Name *
                  </Label>
                  <Input
                    id="name"
                    value={newProject.projectName || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectName: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newProject.projectDescription || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectDescription: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="owner" className="text-right">
                    Project Owner
                  </Label>
                  <Input
                    id="owner"
                    value={newProject.projectOwner || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectOwner: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter project owner name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="effort" className="text-right">
                    Effort Level
                  </Label>
                  <Select
                    value={newProject.effortLevel || 'medium'}
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, effortLevel: value as Project['effortLevel'] }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commitment" className="text-right">
                    Hours/Week
                  </Label>
                  <Input
                    id="commitment"
                    type="number"
                    value={newProject.timeCommitmentPerWeek || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, timeCommitmentPerWeek: parseInt(e.target.value) || undefined }))}
                    className="col-span-3"
                    placeholder="Enter hours per week"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Target Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newProject.targetCompletionDate || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProject.projectName}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className={`p-4 rounded-lg ${column.color}`}>
                  <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                    {column.title}
                    <Badge variant="secondary" className="ml-2">
                      {projectsByStatus[column.id]?.length || 0}
                    </Badge>
                  </h3>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'
                      }`}
                    >
                      {projectsByStatus[column.id]?.map((project, index) => (
                        <Draggable key={project.id} draggableId={project.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                              } ${isOverdue(project) ? 'border-red-200 bg-red-50' : ''}`}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-sm font-medium leading-tight">
                                    {project.projectName}
                                  </CardTitle>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteProject(project.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {project.projectDescription && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {project.projectDescription}
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-2">
                                  {project.effortLevel && (
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${effortLevelConfig[project.effortLevel].color}`}
                                    >
                                      {effortLevelConfig[project.effortLevel].label}
                                    </Badge>
                                  )}
                                  
                                  {project.projectOwner && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <User className="h-3 w-3 mr-1" />
                                      {project.projectOwner}
                                    </div>
                                  )}
                                  
                                  {project.timeCommitmentPerWeek && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {project.timeCommitmentPerWeek}h/week
                                    </div>
                                  )}
                                  
                                  {project.targetCompletionDate && (
                                    <div className={`flex items-center text-xs ${
                                      isOverdue(project) ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(project.targetCompletionDate).toLocaleDateString()}
                                      {isOverdue(project) && (
                                        <AlertTriangle className="h-3 w-3 ml-1" />
                                      )}
                                    </div>
                                  )}
                                  
                                  {project.risksBlockers && (
                                    <div className="flex items-center text-xs text-red-600">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Risk
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </Layout>
  )
}