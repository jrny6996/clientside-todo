"use client"

import type React from "react"
import { useState } from "react"
import type { ProjectItem, TodoItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Plus, Pencil, FolderOpen, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ProjectManagerProps {
  projects: ProjectItem[]
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>
  todos: TodoItem[]
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>
  currentDate: string
}

export default function ProjectManager({ projects, setProjects, todos, setTodos, currentDate }: ProjectManagerProps) {
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectTasks, setNewProjectTasks] = useState("")
  const [taskOrder, setTaskOrder] = useState<"ordered" | "unordered">("unordered")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const addProject = () => {
    if (newProjectName.trim() === "") return

    const projectId = Date.now().toString()
    const newProject: ProjectItem = {
      id: projectId,
      name: newProjectName,
      description: newProjectDescription || undefined,
      active: true,
      timestamp: currentDate,
      ordered: taskOrder === "ordered",
    }

    // Parse tasks from the textarea
    const taskLines = newProjectTasks
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Create tasks for the project
    const newTasks: TodoItem[] = taskLines.map((taskText, index) => {
      const taskPrefix = taskOrder === "ordered" ? `${index + 1}. ` : ""
      // For ordered projects, only activate the first task
      // For unordered projects, don't activate any tasks initially
      const isActive = taskOrder === "ordered" && index === 0

      return {
        id: `${Date.now()}-${index}`,
        text: `${taskPrefix}${taskText}`,
        completed: false,
        timestamp: currentDate,
        projectId: projectId,
        notes: "",
        active: isActive,
      }
    })

    setProjects([...projects, newProject])
    if (newTasks.length > 0) {
      setTodos((prev) => [...prev, ...newTasks])
    }

    // Reset form
    setNewProjectName("")
    setNewProjectDescription("")
    setNewProjectTasks("")
    setTaskOrder("unordered")
  }

  const toggleProjectActive = (id: string) => {
    setProjects(projects.map((project) => (project.id === id ? { ...project, active: !project.active } : project)))
  }

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id))
    // Also remove all tasks associated with this project
    setTodos(todos.filter((todo) => todo.projectId !== id))
  }

  const startEditing = (project: ProjectItem) => {
    setEditingId(project.id)
    setEditName(project.name)
    setEditDescription(project.description || "")
  }

  const saveEdit = () => {
    if (editName.trim() === "") return

    setProjects(
      projects.map((project) =>
        project.id === editingId ? { ...project, name: editName, description: editDescription || undefined } : project,
      ),
    )
    setEditingId(null)
  }

  const getProjectTaskStats = (projectId: string) => {
    const projectTasks = todos.filter((todo) => todo.projectId === projectId)
    const completedTasks = projectTasks.filter((todo) => todo.completed)
    const activeTasks = projectTasks.filter((todo) => todo.active)
    return { total: projectTasks.length, completed: completedTasks.length, active: activeTasks.length }
  }

  const activateNextTask = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const projectTasks = todos.filter((todo) => todo.projectId === projectId).sort((a, b) => a.id.localeCompare(b.id))

    if (project.ordered) {
      // For ordered projects, activate the next incomplete task
      const nextTask = projectTasks.find((task) => !task.completed && !task.active)
      if (nextTask) {
        setTodos(todos.map((todo) => (todo.id === nextTask.id ? { ...todo, active: true } : todo)))
      }
    } else {
      // For unordered projects, check if we can activate one more task
      const activeTasks = projectTasks.filter((task) => task.active && !task.completed)
      if (activeTasks.length === 0) {
        const nextTask = projectTasks.find((task) => !task.completed && !task.active)
        if (nextTask) {
          setTodos(todos.map((todo) => (todo.id === nextTask.id ? { ...todo, active: true } : todo)))
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Management</CardTitle>
        <CardDescription>Create projects with tasks and manage their activation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Input
                id="project-description"
                placeholder="Brief project description..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-tasks">Project Tasks (Optional)</Label>
            <Textarea
              id="project-tasks"
              placeholder="Enter tasks, one per line:&#10;Design wireframes&#10;Set up database&#10;Create user interface&#10;Write tests"
              value={newProjectTasks}
              onChange={(e) => setNewProjectTasks(e.target.value)}
              rows={4}
            />
          </div>

          {newProjectTasks.trim() && (
            <div className="space-y-2">
              <Label>Task Type</Label>
              <RadioGroup value={taskOrder} onValueChange={(value) => setTaskOrder(value as "ordered" | "unordered")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unordered" id="unordered" />
                  <Label htmlFor="unordered" className="text-sm">
                    Unordered (activate one at a time)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ordered" id="ordered" />
                  <Label htmlFor="ordered" className="text-sm">
                    Ordered (activate next task automatically)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button onClick={addProject} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Project{" "}
            {newProjectTasks.trim() && `with ${newProjectTasks.split("\n").filter((line) => line.trim()).length} tasks`}
          </Button>
        </div>

        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects created yet. Add one above!</p>
          ) : (
            projects.map((project) => {
              const taskStats = getProjectTaskStats(project.id)
              return (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    project.active ? "bg-background" : "bg-muted/30"
                  }`}
                >
                  {editingId === project.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Project name"
                        className="font-medium"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Project description (optional)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={saveEdit} size="sm">
                          Save
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <FolderOpen
                            className={`h-5 w-5 ${project.active ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge variant={project.active ? "default" : "secondary"}>
                            {project.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.ordered ? "Ordered" : "Unordered"}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground ml-8">{project.description}</p>
                        )}
                        <div className="flex items-center space-x-4 ml-8">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>
                              {taskStats.completed}/{taskStats.total} completed
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{taskStats.active} active</span>
                          </div>
                          {taskStats.total > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {Math.round((taskStats.completed / taskStats.total) * 100)}% complete
                            </div>
                          )}
                        </div>
                        {project.active && taskStats.active === 0 && taskStats.completed < taskStats.total && (
                          <div className="ml-8">
                            <Button onClick={() => activateNextTask(project.id)} size="sm" variant="outline">
                              Activate Next Task
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`active-${project.id}`} className="text-sm">
                            Active
                          </Label>
                          <Switch
                            id={`active-${project.id}`}
                            checked={project.active}
                            onCheckedChange={() => toggleProjectActive(project.id)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(project)}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProject(project.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {projects.filter((p) => p.active).length} of {projects.length} projects are active
      </CardFooter>
    </Card>
  )
}
