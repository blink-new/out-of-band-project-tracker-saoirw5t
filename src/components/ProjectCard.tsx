import { useDraggable } from '@dnd-kit/core'
import { 
  Clock, 
  User, 
  AlertTriangle, 
  Calendar,
  GripVertical
} from 'lucide-react'
import { Project } from '../types'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

interface ProjectCardProps {
  project: Project
  isDragging?: boolean
}

const effortLevelConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' }
}

export default function ProjectCard({ project, isDragging = false }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id: project.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const isOverdue = project.targetCompletionDate && 
    new Date(project.targetCompletionDate) < new Date() && 
    project.status !== 'completed'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isCurrentlyDragging || isDragging 
          ? 'opacity-50 rotate-3 scale-105 shadow-lg' 
          : 'hover:shadow-md'
      } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {project.projectName}
          </h3>
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        
        {project.projectDescription && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {project.projectDescription}
          </p>
        )}

        <div className="space-y-2">
          {/* Effort Level */}
          {project.effortLevel && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${effortLevelConfig[project.effortLevel].color}`}
            >
              {effortLevelConfig[project.effortLevel].label} Effort
            </Badge>
          )}

          {/* Time Commitment */}
          {project.timeCommitmentPerWeek && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {project.timeCommitmentPerWeek}h/week
            </div>
          )}

          {/* Project Owner */}
          {project.projectOwner && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              {project.projectOwner}
            </div>
          )}

          {/* Target Date */}
          {project.targetCompletionDate && (
            <div className={`flex items-center text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3 mr-1" />
              Due: {new Date(project.targetCompletionDate).toLocaleDateString()}
            </div>
          )}

          {/* Risks/Blockers */}
          {project.risksBlockers && (
            <div className="flex items-center text-xs text-red-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span className="truncate">Risk: {project.risksBlockers}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}