import { useState } from 'react'
import { X } from 'lucide-react'
import { Project } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (project: Partial<Project>) => void
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    projectOwner: '',
    effortLevel: 'medium' as Project['effortLevel'],
    timeCommitmentPerWeek: '',
    targetCompletionDate: '',
    expectedOutcomes: '',
    risksBlockers: '',
    supportRole: '',
    meetingCadence: '',
    commChannel: '',
    projectDocsLinks: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const projectData: Partial<Project> = {
      ...formData,
      timeCommitmentPerWeek: formData.timeCommitmentPerWeek ? parseInt(formData.timeCommitmentPerWeek) : undefined,
      targetCompletionDate: formData.targetCompletionDate || undefined
    }
    
    onSubmit(projectData)
    
    // Reset form
    setFormData({
      projectName: '',
      projectDescription: '',
      projectOwner: '',
      effortLevel: 'medium',
      timeCommitmentPerWeek: '',
      targetCompletionDate: '',
      expectedOutcomes: '',
      risksBlockers: '',
      supportRole: '',
      meetingCadence: '',
      commChannel: '',
      projectDocsLinks: ''
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="md:col-span-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Project Description */}
            <div className="md:col-span-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleChange('projectDescription', e.target.value)}
                placeholder="Describe the project goals and scope"
                rows={3}
              />
            </div>

            {/* Project Owner */}
            <div>
              <Label htmlFor="projectOwner">Project Owner</Label>
              <Input
                id="projectOwner"
                value={formData.projectOwner}
                onChange={(e) => handleChange('projectOwner', e.target.value)}
                placeholder="Who is responsible for this project?"
              />
            </div>

            {/* Support Role */}
            <div>
              <Label htmlFor="supportRole">Support Role</Label>
              <Input
                id="supportRole"
                value={formData.supportRole}
                onChange={(e) => handleChange('supportRole', e.target.value)}
                placeholder="Role in support team"
              />
            </div>

            {/* Effort Level */}
            <div>
              <Label htmlFor="effortLevel">Effort Level</Label>
              <Select value={formData.effortLevel} onValueChange={(value) => handleChange('effortLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Commitment */}
            <div>
              <Label htmlFor="timeCommitmentPerWeek">Time Commitment (hours/week)</Label>
              <Input
                id="timeCommitmentPerWeek"
                type="number"
                value={formData.timeCommitmentPerWeek}
                onChange={(e) => handleChange('timeCommitmentPerWeek', e.target.value)}
                placeholder="Hours per week"
                min="1"
                max="40"
              />
            </div>

            {/* Target Completion Date */}
            <div className="md:col-span-2">
              <Label htmlFor="targetCompletionDate">Target Completion Date</Label>
              <Input
                id="targetCompletionDate"
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => handleChange('targetCompletionDate', e.target.value)}
              />
            </div>

            {/* Expected Outcomes */}
            <div className="md:col-span-2">
              <Label htmlFor="expectedOutcomes">Expected Outcomes</Label>
              <Textarea
                id="expectedOutcomes"
                value={formData.expectedOutcomes}
                onChange={(e) => handleChange('expectedOutcomes', e.target.value)}
                placeholder="What are the expected results?"
                rows={2}
              />
            </div>

            {/* Meeting Cadence */}
            <div>
              <Label htmlFor="meetingCadence">Meeting Cadence</Label>
              <Input
                id="meetingCadence"
                value={formData.meetingCadence}
                onChange={(e) => handleChange('meetingCadence', e.target.value)}
                placeholder="e.g., Weekly, Bi-weekly"
              />
            </div>

            {/* Communication Channel */}
            <div>
              <Label htmlFor="commChannel">Communication Channel</Label>
              <Input
                id="commChannel"
                value={formData.commChannel}
                onChange={(e) => handleChange('commChannel', e.target.value)}
                placeholder="e.g., Slack, Teams, Email"
              />
            </div>

            {/* Project Docs/Links */}
            <div className="md:col-span-2">
              <Label htmlFor="projectDocsLinks">Project Docs/Wiki Links</Label>
              <Input
                id="projectDocsLinks"
                value={formData.projectDocsLinks}
                onChange={(e) => handleChange('projectDocsLinks', e.target.value)}
                placeholder="Links to relevant documentation"
              />
            </div>

            {/* Risks/Blockers */}
            <div className="md:col-span-2">
              <Label htmlFor="risksBlockers">Risks/Blockers</Label>
              <Textarea
                id="risksBlockers"
                value={formData.risksBlockers}
                onChange={(e) => handleChange('risksBlockers', e.target.value)}
                placeholder="Identify potential risks or current blockers"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}