"use client"

import type React from "react"

import { useState } from "react"
import type { HabitItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Flame, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HabitTrackerProps {
  habits: HabitItem[]
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>
  currentDate: string
}

export default function HabitTracker({ habits, setHabits, currentDate }: HabitTrackerProps) {
  const [newHabitName, setNewHabitName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const addHabit = () => {
    if (newHabitName.trim() === "") return

    const newHabit: HabitItem = {
      id: Date.now().toString(),
      name: newHabitName,
      completed: false,
      streak: 0,
      timestamp: currentDate,
    }

    setHabits([...habits, newHabit])
    setNewHabitName("")
  }

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const wasCompleted = habit.completed
          // If marking as complete, increment streak
          // If marking as incomplete, decrement streak (but not below 0)
          const newStreak = wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1

          return {
            ...habit,
            completed: !wasCompleted,
            streak: newStreak,
            timestamp: currentDate,
          }
        }
        return habit
      }),
    )
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))
  }

  const startEditing = (habit: HabitItem) => {
    setEditingId(habit.id)
    setEditName(habit.name)
  }

  const saveEdit = () => {
    if (editName.trim() === "") return

    setHabits(habits.map((habit) => (habit.id === editingId ? { ...habit, name: editName } : habit)))
    setEditingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits</CardTitle>
        <CardDescription>Track your daily habits and build streaks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Add a new habit..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addHabit()
            }}
          />
          <Button onClick={addHabit} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No habits tracked yet. Add one above!</p>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    id={`habit-${habit.id}`}
                    checked={habit.completed}
                    onCheckedChange={() => toggleHabit(habit.id)}
                  />
                  <div className="flex flex-col">
                    {editingId === habit.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
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
                        htmlFor={`habit-${habit.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {habit.name}
                      </label>
                    )}
                    {habit.streak > 0 && editingId !== habit.id && (
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs flex items-center gap-1 h-5 px-2">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{habit.streak} day streak</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {editingId !== habit.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(habit)}
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHabit(habit.id)}
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
        {habits.filter((h) => h.completed).length} of {habits.length} habits completed today
      </CardFooter>
    </Card>
  )
}
