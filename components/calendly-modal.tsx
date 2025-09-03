"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Schedule a Call</DialogTitle>
        </DialogHeader>
        <div className="flex-1 p-6 pt-0">
          <iframe
            src="https://calendly.com/umangthakkar005/30min"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a call with Umang"
            className="rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
