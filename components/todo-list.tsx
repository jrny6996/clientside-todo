"use client"

import type React from "react"
import { useState } from "react"
import type { TodoItem, ProjectItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Pencil, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import TaskDetailModal from "@/components/task-detail-modal"

interface TodoListProps {
  todos: TodoItem[]
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>
  projects: ProjectItem[]
  currentDate: string
}

export default function TodoList({ todos, setTodos, projects, currentDate }: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState("")
  const [newTodoProject, setNewTodoProject] = useState<string>("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const activeProjects = projects.filter((project) => project.active)

  const addTodo = () => {
    if (newTodoText.trim() === "") return

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      timestamp: currentDate,
      projectId: newTodoProject || undefined,
      notes: "",
      active: true, // New standalone tasks are active by default
    }

    setTodos([...todos, newTodo])
    setNewTodoText("")
    setNewTodoProject("")
  }

  const toggleTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    const updatedTodos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTodos(updatedTodos)

    // If this task was completed and belongs to a project, handle project-specific logic
    if (!todo.completed && todo.projectId) {
      const project = projects.find((p) => p.id === todo.projectId)
      if (project) {
        setTimeout(() => {
          activateNextProjectTask(todo.projectId!, project.ordered)
        }, 100)
      }
    }
  }

  const activateNextProjectTask = (projectId: string, isOrdered: boolean) => {
    const projectTasks = todos.filter((todo) => todo.projectId === projectId).sort((a, b) => a.id.localeCompare(b.id))

    if (isOrdered) {
      // For ordered projects, activate the next incomplete task
      const nextTask = projectTasks.find((task) => !task.completed && !task.active)
      if (nextTask) {
        setTodos((prev) => prev.map((todo) => (todo.id === nextTask.id ? { ...todo, active: true } : todo)))
      }
    } else {
      // For unordered projects, check if we can activate one more task (only if no active tasks remain)
      const activeTasks = projectTasks.filter((task) => task.active && !task.completed)
      if (activeTasks.length === 0) {
        const nextTask = projectTasks.find((task) => !task.completed && !task.active)
        if (nextTask) {
          setTodos((prev) => prev.map((todo) => (todo.id === nextTask.id ? { ...todo, active: true } : todo)))
        }
      }
    }
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

  // Filter todos to show only active tasks from active projects or standalone active tasks
  const visibleTodos = todos.filter((todo) => {
    if (todo.timestamp !== currentDate) return false
    if (!todo.active) return false // Only show active tasks
    if (!todo.projectId) return true // Standalone active tasks
    return activeProjects.some((project) => project.id === todo.projectId)
  })

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
          <CardTitle className="text-lg sm:text-xl">Active Tasks</CardTitle>
          <CardDescription className="text-sm">Your currently active tasks and to-dos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile-optimized input section */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-2">
            <Input
              placeholder="Add a new task..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo()
              }}
              className="flex-1 h-10 sm:h-9"
            />
            <div className="flex space-x-2">
              <Select value={newTodoProject} onValueChange={setNewTodoProject}>
                <SelectTrigger className="w-full sm:w-[140px] h-10 sm:h-9">
                  <SelectValue placeholder="Project" />
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
              <Button onClick={addTodo} size="icon" className="h-10 w-10 sm:h-9 sm:w-9 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {visibleTodos.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <p className="text-sm sm:text-base">No active tasks for today.</p>
                <p className="text-xs sm:text-sm mt-2">Add a task above or activate tasks from your Task Pool.</p>
              </div>
            ) : (
              visibleTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="mt-0.5 sm:mt-0 shrink-0"
                    />
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
                            <label
                              htmlFor={`todo-${todo.id}`}
                              className={`text-sm sm:text-base font-medium leading-snug cursor-pointer break-words ${
                                todo.completed ? "line-through text-muted-foreground" : ""
                              }`}
                              onClick={() => setSelectedTaskId(todo.id)}
                            >
                              {todo.text}
                            </label>
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
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-4">
          {visibleTodos.filter((t) => t.completed).length} of {visibleTodos.length} active tasks completed
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
