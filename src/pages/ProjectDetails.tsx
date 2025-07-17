import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  FileText,
  Target,
  Users,
  MessageSquare,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react'
import Layout from '../components/Layout'
import { User as UserType, Project } from '../types'
import { getProject, updateProject, convertProjectToFrontend } from '../lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'

interface ProjectDetailsProps {
  user: UserType
}

// Mock data - in real app this would come from the database
const mockProjects: Project[] = [
  {
    id: '1',
    projectName: 'Customer Portal Enhancement',
    projectDescription: 'Improve the customer self-service portal with new features including advanced search, user dashboard improvements, and mobile responsiveness enhancements.',
    status: 'in_progress',
    effortLevel: 'high',
    timeCommitmentPerWeek: 15,
    projectOwner: 'John Smith',
    supportManagementResource: 'Sarah Johnson',
    supportRole: 'Technical Lead',
    targetCompletionDate: '2024-08-15',
    startDate: '2024-07-01',
    expectedOutcomes: 'Improved customer satisfaction, reduced support tickets, better user experience',
    trainingNeeded: 'React advanced patterns, API integration best practices',
    toolProcessChange: 'New deployment pipeline, updated testing framework',
    meetingCadence: 'Weekly standup, bi-weekly review',
    commChannel: '#customer-portal-team',
    escalationPath: 'Sarah Johnson -> Mike Davis -> CTO',
    dependencies: 'API team completion of user endpoints, Design team mockups',
    keyMilestones: 'Phase 1: Search feature (July 15), Phase 2: Dashboard (Aug 1), Phase 3: Mobile (Aug 15)',
    risksBlockers: 'API integration delays, potential scope creep from stakeholders',
    actionItems: '1. Complete search API integration, 2. Review mobile designs, 3. Setup testing environment',
    latestUpdate: 'Search feature 80% complete, mobile designs approved, testing environment ready',
    projectDocsLinks: 'https://wiki.company.com/customer-portal, https://github.com/company/portal-docs',
    businessId: 'business-1',
    createdBy: 'user-1',
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z'
  }
]

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
}

const effortLevelConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' }
}

export default function ProjectDetails({ user }: ProjectDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<Project | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return
      
      try {
        const dbProject = await getProject(id)
        if (dbProject) {
          const frontendProject = convertProjectToFrontend(dbProject)
          setProject(frontendProject)
          setEditedProject(frontendProject)
        } else {
          // Fallback to mock data
          const foundProject = mockProjects.find(p => p.id === id)
          if (foundProject) {
            setProject(foundProject)
            setEditedProject(foundProject)
          }
        }
      } catch (error) {
        console.error('Error loading project:', error)
        // Fallback to mock data
        const foundProject = mockProjects.find(p => p.id === id)
        if (foundProject) {
          setProject(foundProject)
          setEditedProject(foundProject)
        }
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id])

  const handleSave = async () => {
    if (editedProject) {
      try {
        // Convert frontend format to database format for update
        const updates = {
          project_name: editedProject.projectName,
          project_description: editedProject.projectDescription,
          start_date: editedProject.startDate,
          target_completion_date: editedProject.targetCompletionDate,
          status: editedProject.status,
          project_owner: editedProject.projectOwner,
          support_management_resource: editedProject.supportManagementResource,
          support_role: editedProject.supportRole,
          effort_level: editedProject.effortLevel,
          time_commitment_per_week: editedProject.timeCommitmentPerWeek,
          project_docs_links: editedProject.projectDocsLinks,
          expected_outcomes: editedProject.expectedOutcomes,
          training_needed: editedProject.trainingNeeded,
          tool_process_change: editedProject.toolProcessChange,
          meeting_cadence: editedProject.meetingCadence,
          comm_channel: editedProject.commChannel,
          escalation_path: editedProject.escalationPath,
          dependencies: editedProject.dependencies,
          key_milestones: editedProject.keyMilestones,
          risks_blockers: editedProject.risksBlockers,
          action_items: editedProject.actionItems,
          latest_update: editedProject.latestUpdate
        }
        
        await updateProject(editedProject.id, updates)
        setProject({ ...editedProject, updatedAt: new Date().toISOString() })
        setIsEditing(false)
      } catch (error) {
        console.error('Error saving project:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditedProject(project)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading project...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Project not found</p>
        </div>
      </Layout>
    )
  }

  const isOverdue = project.targetCompletionDate && 
    new Date(project.targetCompletionDate) < new Date() && 
    project.status !== 'completed'

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={statusConfig[project.status].color}>
                  {statusConfig[project.status].label}
                </Badge>
                {project.effortLevel && (
                  <Badge className={effortLevelConfig[project.effortLevel].color}>
                    {effortLevelConfig[project.effortLevel].label} Effort
                  </Badge>
                )}
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.projectDescription || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, projectDescription: e.target.value } : null)}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.projectDescription || 'No description provided'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Expected Outcomes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.expectedOutcomes || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, expectedOutcomes: e.target.value } : null)}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.expectedOutcomes || 'No expected outcomes defined'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Latest Update</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.latestUpdate || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, latestUpdate: e.target.value } : null)}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.latestUpdate || 'No recent updates'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedProject?.status}
                        onValueChange={(value) => setEditedProject(prev => prev ? { ...prev, status: value as Project['status'] } : null)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-900">{statusConfig[project.status].label}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Effort Level</Label>
                    {isEditing ? (
                      <Select
                        value={editedProject?.effortLevel}
                        onValueChange={(value) => setEditedProject(prev => prev ? { ...prev, effortLevel: value as Project['effortLevel'] } : null)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-900">{project.effortLevel ? effortLevelConfig[project.effortLevel].label : 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject?.startDate || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Target Completion</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject?.targetCompletionDate || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, targetCompletionDate: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className={`mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'Not specified'}
                        {isOverdue && <AlertTriangle className="inline h-4 w-4 ml-1" />}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Time Commitment (hours/week)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedProject?.timeCommitmentPerWeek || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, timeCommitmentPerWeek: parseInt(e.target.value) || undefined } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.timeCommitmentPerWeek ? `${project.timeCommitmentPerWeek} hours` : 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources & Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Resources & Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Project Owner</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject?.projectOwner || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, projectOwner: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.projectOwner || 'Not assigned'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Support Management Resource</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject?.supportManagementResource || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, supportManagementResource: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.supportManagementResource || 'Not assigned'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Support Role</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject?.supportRole || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, supportRole: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.supportRole || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Project Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Key Milestones</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.keyMilestones || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, keyMilestones: e.target.value } : null)}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.keyMilestones || 'No milestones defined'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Dependencies</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.dependencies || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, dependencies: e.target.value } : null)}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.dependencies || 'No dependencies identified'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Action Items</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.actionItems || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, actionItems: e.target.value } : null)}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.actionItems || 'No action items defined'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Meeting Cadence</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject?.meetingCadence || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, meetingCadence: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.meetingCadence || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Communication Channel</Label>
                    {isEditing ? (
                      <Input
                        value={editedProject?.commChannel || ''}
                        onChange={(e) => setEditedProject(prev => prev ? { ...prev, commChannel: e.target.value } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{project.commChannel || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Escalation Path</Label>
                  {isEditing ? (
                    <Input
                      value={editedProject?.escalationPath || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, escalationPath: e.target.value } : null)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{project.escalationPath || 'Not defined'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-auto">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-auto">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Created by:</span>
                  <span className="ml-auto">{project.createdBy}</span>
                </div>
              </CardContent>
            </Card>

            {/* Risks & Blockers */}
            {project.risksBlockers && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Risks & Blockers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.risksBlockers || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, risksBlockers: e.target.value } : null)}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{project.risksBlockers}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Training & Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training & Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Training Needed</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.trainingNeeded || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, trainingNeeded: e.target.value } : null)}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{project.trainingNeeded || 'None specified'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Tool/Process Changes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.toolProcessChange || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, toolProcessChange: e.target.value } : null)}
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{project.toolProcessChange || 'None specified'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documentation Links */}
            {project.projectDocsLinks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedProject?.projectDocsLinks || ''}
                      onChange={(e) => setEditedProject(prev => prev ? { ...prev, projectDocsLinks: e.target.value } : null)}
                      rows={2}
                      placeholder="Enter documentation links (one per line)"
                    />
                  ) : (
                    <div className="space-y-2">
                      {project.projectDocsLinks.split(',').map((link, index) => (
                        <a
                          key={index}
                          href={link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {link.trim()}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}