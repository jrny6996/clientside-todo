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
import { Trash2, Plus, Pencil, FolderOpen, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
  const [isFormOpen, setIsFormOpen] = useState(false)

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
    setIsFormOpen(false)
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
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Project Management</CardTitle>
        <CardDescription className="text-sm">Create projects with tasks and manage their activation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collapsible form for mobile */}
        <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-10">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Project
              </span>
              {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-sm font-medium">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <Input
                    id="project-description"
                    placeholder="Brief project description..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-tasks" className="text-sm font-medium">
                  Project Tasks (Optional)
                </Label>
                <Textarea
                  id="project-tasks"
                  placeholder="Enter tasks, one per line:&#10;Design wireframes&#10;Set up database&#10;Create user interface&#10;Write tests"
                  value={newProjectTasks}
                  onChange={(e) => setNewProjectTasks(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {newProjectTasks.trim() && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Task Type</Label>
                  <RadioGroup
                    value={taskOrder}
                    onValueChange={(value) => setTaskOrder(value as "ordered" | "unordered")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unordered" id="unordered" />
                      <Label htmlFor="unordered" className="text-sm leading-relaxed">
                        Unordered (activate one at a time)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ordered" id="ordered" />
                      <Label htmlFor="ordered" className="text-sm leading-relaxed">
                        Ordered (activate next task automatically)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button onClick={addProject} className="w-full h-10">
                <Plus className="h-4 w-4 mr-2" />
                Create Project{" "}
                {newProjectTasks.trim() &&
                  `with ${newProjectTasks.split("\n").filter((line) => line.trim()).length} tasks`}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No projects created yet. Create one above!</p>
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
                        className="font-medium h-10"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Project description (optional)"
                        className="h-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button onClick={saveEdit} size="sm" className="h-9">
                          Save
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" size="sm" className="h-9">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <FolderOpen
                              className={`h-5 w-5 shrink-0 ${project.active ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <h3 className="font-semibold text-base sm:text-lg break-words">{project.name}</h3>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={project.active ? "default" : "secondary"} className="text-xs">
                                {project.active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {project.ordered ? "Ordered" : "Unordered"}
                              </Badge>
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground break-words">{project.description}</p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                              <span>
                                {taskStats.completed}/{taskStats.total} completed
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                              <span>{taskStats.active} active</span>
                            </div>
                            {taskStats.total > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {Math.round((taskStats.completed / taskStats.total) * 100)}% complete
                              </div>
                            )}
                          </div>
                          {project.active && taskStats.active === 0 && taskStats.completed < taskStats.total && (
                            <Button
                              onClick={() => activateNextTask(project.id)}
                              size="sm"
                              variant="outline"
                              className="h-8"
                            >
                              Activate Next Task
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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
                          <div className="flex space-x-1">
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
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4">
        {projects.filter((p) => p.active).length} of {projects.length} projects are active
      </CardFooter>
    </Card>
  )
}
