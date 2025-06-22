"use client"

import type React from "react"

import { useState } from "react"
import type { FoodItem } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Clock, Pencil } from "lucide-react"
import { Label } from "@/components/ui/label"

interface CalorieTrackerProps {
  foodEntries: FoodItem[]
  setFoodEntries: React.Dispatch<React.SetStateAction<FoodItem[]>>
  currentDate: string
}

export default function CalorieTracker({ foodEntries, setFoodEntries, currentDate }: CalorieTrackerProps) {
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodCalories, setNewFoodCalories] = useState("")
  const [newFoodProtein, setNewFoodProtein] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editCalories, setEditCalories] = useState("")
  const [editProtein, setEditProtein] = useState("")

  const addFoodEntry = () => {
    if (newFoodName.trim() === "" || isNaN(Number(newFoodCalories)) || Number(newFoodCalories) <= 0) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const newEntry: FoodItem = {
      id: Date.now().toString(),
      name: newFoodName,
      calories: Number(newFoodCalories),
      protein: newFoodProtein ? Number(newFoodProtein) : undefined,
      time: timeString,
      timestamp: currentDate,
    }

    setFoodEntries([...foodEntries, newEntry])
    setNewFoodName("")
    setNewFoodCalories("")
    setNewFoodProtein("")
  }

  const startEditing = (entry: FoodItem) => {
    setEditingId(entry.id)
    setEditName(entry.name)
    setEditCalories(entry.calories.toString())
    setEditProtein(entry.protein?.toString() || "")
  }

  const saveEdit = () => {
    if (editName.trim() === "" || isNaN(Number(editCalories)) || Number(editCalories) <= 0) return

    setFoodEntries(
      foodEntries.map((entry) =>
        entry.id === editingId
          ? {
              ...entry,
              name: editName,
              calories: Number(editCalories),
              protein: editProtein ? Number(editProtein) : undefined,
            }
          : entry,
      ),
    )
    setEditingId(null)
  }

  const deleteFoodEntry = (id: string) => {
    setFoodEntries(foodEntries.filter((entry) => entry.id !== id))
  }

  const todaysEntries = foodEntries.filter((entry) => entry.timestamp === currentDate)
  const totalCaloriesToday = todaysEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProteinToday = todaysEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calories & Food</CardTitle>
        <CardDescription>Track your food intake, calories, and protein</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-5">
            <Label htmlFor="food-name">Food Item</Label>
            <Input
              id="food-name"
              placeholder="What did you eat?"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="food-calories">Calories</Label>
            <Input
              id="food-calories"
              type="number"
              placeholder="Calories"
              value={newFoodCalories}
              onChange={(e) => setNewFoodCalories(e.target.value)}
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="food-protein">Protein (g)</Label>
            <Input
              id="food-protein"
              type="number"
              placeholder="Optional"
              value={newFoodProtein}
              onChange={(e) => setNewFoodProtein(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addFoodEntry()
              }}
            />
          </div>
          <div className="col-span-12 sm:col-span-1 flex sm:items-end">
            <Button onClick={addFoodEntry} className="w-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {todaysEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No food entries for today. Add one above!</p>
          ) : (
            todaysEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {editingId === entry.id ? (
                  <div className="grid grid-cols-12 gap-2 w-full">
                    <div className="col-span-12 sm:col-span-5">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Food name"
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Input
                        type="number"
                        value={editCalories}
                        onChange={(e) => setEditCalories(e.target.value)}
                        placeholder="Calories"
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Input
                        type="number"
                        value={editProtein}
                        onChange={(e) => setEditProtein(e.target.value)}
                        placeholder="Protein (g)"
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-1 flex justify-end">
                      <Button onClick={saveEdit} size="sm" className="h-8">
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium">{entry.name}</span>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{entry.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold">{entry.calories} cal</div>
                        {entry.protein !== undefined && (
                          <div className="text-xs text-muted-foreground">{entry.protein}g protein</div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(entry)}
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFoodEntry(entry.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-xs text-muted-foreground">{todaysEntries.length} food entries today</span>
        <div className="text-right">
          <div className="font-semibold">Total: {totalCaloriesToday} calories</div>
          {totalProteinToday > 0 && (
            <div className="text-xs text-muted-foreground">Total protein: {totalProteinToday}g</div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
