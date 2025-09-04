"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  const calendlySrc =
    "https://calendly.com/umangthakkar005/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=16a34a"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* NOTE: give the dialog a real height; make inner wrapper fill it */}
      <DialogContent className="w-[95vw] sm:max-w-[900px] h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Schedule a Call</DialogTitle>
        </DialogHeader>

        <div className="relative h-[calc(80vh-68px)] px-6 pb-6">
          <iframe
            src={calendlySrc}
            title="Schedule a call with Umang"
            className="h-full w-full rounded-lg border"
            // helpful permissions for Calendly
            allow="clipboard-write; fullscreen"
            // resilience
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          />
        </div>

        {/* Fallback: open Calendly in a new tab if embeds are ever blocked */}
        <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
          Having trouble loading the scheduler?{" "}
          <a
            href={calendlySrc.replace("?","?utm_source=modal&")} target="_blank" rel="noopener noreferrer"
            className="underline"
          >
            Open Calendly in a new tab
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  )
}
