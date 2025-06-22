"use client"

import type React from "react"

import { useState } from "react"
import type { TodoItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Pencil } from "lucide-react"

interface TodoListProps {
  todos: TodoItem[]
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>
  currentDate: string
}

export default function TodoList({ todos, setTodos, currentDate }: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const addTodo = () => {
    if (newTodoText.trim() === "") return

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      timestamp: currentDate,
    }

    setTodos([...todos, newTodo])
    setNewTodoText("")
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
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

  const todaysTodos = todos.filter((todo) => todo.timestamp === currentDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage your daily tasks and to-dos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo()
            }}
          />
          <Button onClick={addTodo} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {todaysTodos.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tasks for today. Add one above!</p>
          ) : (
            todaysTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
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
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        todo.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {todo.text}
                    </label>
                  )}
                </div>
                <div className="flex space-x-1">
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
      <CardFooter className="text-xs text-muted-foreground">
        {todaysTodos.filter((t) => t.completed).length} of {todaysTodos.length} tasks completed
      </CardFooter>
    </Card>
  )
}
