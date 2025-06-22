"use client"

import type React from "react"
import { useState } from "react"
import type { TodoItem, ProjectItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Play, Pencil, FileText, Archive, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import TaskDetailModal from "@/components/task-detail-modal"

interface TaskPoolProps {
  todos: TodoItem[]
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>
  projects: ProjectItem[]
  currentDate: string
}

export default function TaskPool({ todos, setTodos, projects, currentDate }: TaskPoolProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filterProject, setFilterProject] = useState<string>("all")

  const activateTask = (id: string) => {
    const task = todos.find((t) => t.id === id)
    if (!task) return

    // Check project constraints before activating
    if (task.projectId) {
      const project = projects.find((p) => p.id === task.projectId)
      if (project && !project.ordered) {
        // For unordered projects, check if there's already an active task
        const projectTasks = todos.filter((t) => t.projectId === task.projectId)
        const hasActiveTask = projectTasks.some((t) => t.active && !t.completed && t.id !== id)

        if (hasActiveTask) {
          alert("This unordered project already has an active task. Complete it first before activating another.")
          return
        }
      }
    }

    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, active: true } : todo)))
  }

  const deactivateTask = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, active: false } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = () => {
    if (editText.trim() === "") return

    setTodos(todos.map((todo) => (todo.id === editingId ? { ...todo, text: editText } : todo)))
    setEditingId(null)
  }

  const updateTodo = (updatedTodo: TodoItem) => {
    setTodos(todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)))
  }

  // Get all tasks (both active and inactive) for the pool view
  const allTasks = todos.filter((todo) => {
    if (todo.completed) return false // Don't show completed tasks
    if (filterProject === "all") return true
    if (filterProject === "none") return !todo.projectId
    return todo.projectId === filterProject
  })

  const inactiveTasks = allTasks.filter((todo) => !todo.active)
  const activeTasks = allTasks.filter((todo) => todo.active)

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null
    const project = projects.find((p) => p.id === projectId)
    return project?.name
  }

  const selectedTask = selectedTaskId ? todos.find((todo) => todo.id === selectedTaskId) : null

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Archive className="h-5 w-5" />
            Task Pool
          </CardTitle>
          <CardDescription className="text-sm">
            Manage all your tasks - activate them when you're ready to work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile-optimized filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium whitespace-nowrap">Filter by project:</Label>
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="none">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Tasks ({activeTasks.length})
              </h3>
              {activeTasks.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-2 sm:mt-0"></div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit()
                            if (e.key === "Escape") setEditingId(null)
                          }}
                          onBlur={saveEdit}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className="text-sm sm:text-base font-medium cursor-pointer break-words"
                              onClick={() => setSelectedTaskId(todo.id)}
                            >
                              {todo.text}
                            </span>
                            {todo.notes && <FileText className="h-3 w-3 text-muted-foreground shrink-0" />}
                          </div>
                          {todo.projectId && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {getProjectName(todo.projectId)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deactivateTask(todo.id)}
                      className="h-8 w-8 text-orange-600 hover:text-orange-700"
                      title="Deactivate task"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    {editingId !== todo.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(todo)}
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {inactiveTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                Inactive Tasks ({inactiveTasks.length})
              </h3>
              {inactiveTasks.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors opacity-75"
                >
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full shrink-0 mt-2 sm:mt-0"></div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit()
                            if (e.key === "Escape") setEditingId(null)
                          }}
                          onBlur={saveEdit}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className="text-sm sm:text-base font-medium cursor-pointer break-words"
                              onClick={() => setSelectedTaskId(todo.id)}
                            >
                              {todo.text}
                            </span>
                            {todo.notes && <FileText className="h-3 w-3 text-muted-foreground shrink-0" />}
                          </div>
                          {todo.projectId && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {getProjectName(todo.projectId)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => activateTask(todo.id)}
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                      title="Activate task"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    {editingId !== todo.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(todo)}
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {allTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-8 px-4 text-sm">
              No tasks found. Create some tasks in your projects or add standalone tasks.
            </p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-4">
          {activeTasks.length} active • {inactiveTasks.length} inactive • {allTasks.length} total tasks
        </CardFooter>
      </Card>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projects={projects}
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={updateTodo}
        />
      )}
    </>
  )
}
