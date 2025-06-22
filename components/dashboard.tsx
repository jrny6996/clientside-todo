"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ListTodo, Utensils, FolderOpen, Archive } from "lucide-react"
import TodoList from "@/components/todo-list"
import HabitTracker from "@/components/habit-tracker"
import CalorieTracker from "@/components/calorie-tracker"
import ProjectManager from "@/components/project-manager"
import TaskPool from "@/components/task-pool"
import DayTransitionDialog from "@/components/day-transition-dialog"

export type TodoItem = {
  id: string
  text: string
  completed: boolean
  timestamp: string
  projectId?: string
  notes?: string
  active: boolean
}

export type HabitItem = {
  id: string
  name: string
  completed: boolean
  streak: number
  timestamp: string
}

export type FoodItem = {
  id: string
  name: string
  calories: number
  protein?: number
  time: string
  timestamp: string
}

export type ProjectItem = {
  id: string
  name: string
  description?: string
  active: boolean
  timestamp: string
  ordered: boolean
}

export default function Dashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [habits, setHabits] = useState<HabitItem[]>([])
  const [foodEntries, setFoodEntries] = useState<FoodItem[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [showDayTransition, setShowDayTransition] = useState(false)
  const [previousDayData, setPreviousDayData] = useState({
    todos: [] as TodoItem[],
    habits: [] as HabitItem[],
    foodEntries: [] as FoodItem[],
    projects: [] as ProjectItem[],
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedTodos = localStorage.getItem("todos")
    const storedHabits = localStorage.getItem("habits")
    const storedFoodEntries = localStorage.getItem("foodEntries")
    const storedProjects = localStorage.getItem("projects")
    const storedDate = localStorage.getItem("currentDate")

    if (storedTodos) setTodos(JSON.parse(storedTodos))
    if (storedHabits) setHabits(JSON.parse(storedHabits))
    if (storedFoodEntries) setFoodEntries(JSON.parse(storedFoodEntries))
    if (storedProjects) setProjects(JSON.parse(storedProjects))

    // Check if the stored date is different from today
    const today = new Date().toISOString().split("T")[0]

    if (storedDate && storedDate !== today) {
      // Save previous day's data
      setPreviousDayData({
        todos: storedTodos ? JSON.parse(storedTodos) : [],
        habits: storedHabits ? JSON.parse(storedHabits) : [],
        foodEntries: storedFoodEntries ? JSON.parse(storedFoodEntries) : [],
        projects: storedProjects ? JSON.parse(storedProjects) : [],
      })
      setShowDayTransition(true)
    }

    setCurrentDate(today)
    localStorage.setItem("currentDate", today)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
    localStorage.setItem("habits", JSON.stringify(habits))
    localStorage.setItem("foodEntries", JSON.stringify(foodEntries))
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [todos, habits, foodEntries, projects])

  // Handle day transition
  const handleKeepPreviousData = () => {
    setShowDayTransition(false)
  }

  const handleStartNewDay = () => {
    // Reset incomplete todos
    const updatedTodos = todos.map((todo) => {
      if (!todo.completed) {
        return { ...todo, timestamp: currentDate }
      }
      return todo
    })

    // Reset habits for the new day
    const updatedHabits = habits.map((habit) => {
      return { ...habit, completed: false, timestamp: currentDate }
    })

    // Keep food entries but start fresh for today
    setTodos(updatedTodos)
    setHabits(updatedHabits)
    setFoodEntries([])
    setShowDayTransition(false)
  }

  const totalCaloriesToday = foodEntries
    .filter((entry) => entry.timestamp === currentDate)
    .reduce((sum, entry) => sum + entry.calories, 0)

  const activeTodosToday = todos.filter((todo) => todo.timestamp === currentDate && todo.active)
  const completedActiveTodosToday = activeTodosToday.filter((todo) => todo.completed).length

  const completedHabitsToday = habits.filter((habit) => habit.timestamp === currentDate && habit.completed).length

  const activeProjects = projects.filter((project) => project.active)
  const inactiveTasksCount = todos.filter((todo) => !todo.active && !todo.completed).length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your tasks, habits, and nutrition for {new Date(currentDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedActiveTodosToday}/{activeTodosToday.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTodosToday.length === 0
                ? "No active tasks today"
                : `${Math.round((completedActiveTodosToday / activeTodosToday.length) * 100)}% complete`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Pool</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveTasksCount}</div>
            <p className="text-xs text-muted-foreground">Tasks waiting to be activated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedHabitsToday}/{habits.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {habits.length === 0
                ? "No habits tracked"
                : `${Math.round((completedHabitsToday / habits.length) * 100)}% complete`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCaloriesToday}</div>
            <p className="text-xs text-muted-foreground">
              {foodEntries.filter((entry) => entry.timestamp === currentDate).length} food entries today
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="pool" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Task Pool</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Habits</span>
          </TabsTrigger>
          <TabsTrigger value="calories" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span>Calories</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="space-y-4">
          <TodoList todos={todos} setTodos={setTodos} projects={projects} currentDate={currentDate} />
        </TabsContent>
        <TabsContent value="pool" className="space-y-4">
          <TaskPool todos={todos} setTodos={setTodos} projects={projects} currentDate={currentDate} />
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <ProjectManager
            projects={projects}
            setProjects={setProjects}
            todos={todos}
            setTodos={setTodos}
            currentDate={currentDate}
          />
        </TabsContent>
        <TabsContent value="habits" className="space-y-4">
          <HabitTracker habits={habits} setHabits={setHabits} currentDate={currentDate} />
        </TabsContent>
        <TabsContent value="calories" className="space-y-4">
          <CalorieTracker foodEntries={foodEntries} setFoodEntries={setFoodEntries} currentDate={currentDate} />
        </TabsContent>
      </Tabs>

      {showDayTransition && (
        <DayTransitionDialog
          open={showDayTransition}
          onKeepPrevious={handleKeepPreviousData}
          onStartNew={handleStartNewDay}
          previousDate={previousDayData.todos[0]?.timestamp || "previous day"}
          currentDate={currentDate}
        />
      )}
    </div>
  )
}
