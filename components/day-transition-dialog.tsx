"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DayTransitionDialogProps {
  open: boolean
  onKeepPrevious: () => void
  onStartNew: () => void
  previousDate: string
  currentDate: string
}

export default function DayTransitionDialog({
  open,
  onKeepPrevious,
  onStartNew,
  previousDate,
  currentDate,
}: DayTransitionDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Day Detected</DialogTitle>
          <DialogDescription>
            It looks like you're accessing your dashboard on a new day. Would you like to keep your previous data from{" "}
            {formatDate(previousDate)} or start fresh for {formatDate(currentDate)}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={onKeepPrevious}>
            Keep Previous Data
          </Button>
          <Button onClick={onStartNew}>Start New Day</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
