import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Eye
} from 'lucide-react'
import Layout from '../components/Layout'
import { User, Project } from '../types'
import { getBusinessProjects, convertProjectToFrontend } from '../lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'

interface DashboardProps {
  user: User
}

// Mock data for demonstration
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
  }
]

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'bg-gray-500' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'bg-blue-500' },
  review: { label: 'Review', icon: Eye, color: 'bg-amber-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500' }
}

const effortLevelConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' }
}

export default function Dashboard({ user }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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

  const stats = {
    totalProjects: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => {
      if (!p.targetCompletionDate) return false
      return new Date(p.targetCompletionDate) < new Date() && p.status !== 'completed'
    }).length
  }

  const completionRate = stats.totalProjects > 0 ? (stats.completed / stats.totalProjects) * 100 : 0

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <Link to="/projects">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Active projects in your organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <PlayCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Past target completion date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.completed} completed</span>
                <span>{stats.totalProjects} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link to="/projects">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => {
                const StatusIcon = statusConfig[project.status].icon
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${statusConfig[project.status].color}`}>
                        <StatusIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                        <p className="text-sm text-gray-600">{project.projectDescription}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary" className={effortLevelConfig[project.effortLevel || 'low'].color}>
                            {effortLevelConfig[project.effortLevel || 'low'].label} Effort
                          </Badge>
                          {project.timeCommitmentPerWeek && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {project.timeCommitmentPerWeek}h/week
                            </div>
                          )}
                          {project.projectOwner && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-3 w-3 mr-1" />
                              {project.projectOwner}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {statusConfig[project.status].label}
                      </Badge>
                      {project.targetCompletionDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(project.targetCompletionDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.risksBlockers && (
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Risk
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}