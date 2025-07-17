import { useDroppable } from '@dnd-kit/core'
import { Project } from '../types'
import ProjectCard from './ProjectCard'

interface ProjectColumnProps {
  id: string
  title: string
  color: string
  projects: Project[]
}

export default function ProjectColumn({ id, title, color, projects }: ProjectColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div className="flex flex-col h-full">
      <div className={`${color} rounded-t-lg p-3 border-b`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <span className="bg-white bg-opacity-70 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {projects.length}
          </span>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 min-h-[500px] bg-white rounded-b-lg border-l border-r border-b transition-colors ${
          isOver ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
        }`}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Drop projects here
          </div>
        )}
      </div>
    </div>
  )
}