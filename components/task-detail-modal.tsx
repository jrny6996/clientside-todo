"use client"
import { useState, useEffect } from "react"
import type { TodoItem, ProjectItem } from "@/components/dashboard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, FolderOpen } from "lucide-react"

interface TaskDetailModalProps {
  task: TodoItem
  projects: ProjectItem[]
  open: boolean
  onClose: () => void
  onUpdate: (task: TodoItem) => void
}

export default function TaskDetailModal({ task, projects, open, onClose, onUpdate }: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<TodoItem>(task)

  useEffect(() => {
    setEditedTask(task)
  }, [task])

  const handleSave = () => {
    onUpdate(editedTask)
    onClose()
  }

  const activeProjects = projects.filter((project) => project.active)
  const currentProject = projects.find((p) => p.id === editedTask.projectId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>View and edit task information and notes</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="task-completed"
              checked={editedTask.completed}
              onCheckedChange={(checked) => setEditedTask({ ...editedTask, completed: checked as boolean })}
            />
            <Label htmlFor="task-completed" className="text-sm font-medium">
              Mark as completed
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={editedTask.text}
              onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
              placeholder="Enter task title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-project">Project</Label>
            <Select
              value={editedTask.projectId || ""}
              onValueChange={(value) => setEditedTask({ ...editedTask, projectId: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {activeProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={editedTask.notes || ""}
              onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
              placeholder="Add any additional notes or details..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(editedTask.timestamp).toLocaleDateString()}</span>
            </div>
            {currentProject && (
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <Badge variant="outline" className="text-xs">
                  {currentProject.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
