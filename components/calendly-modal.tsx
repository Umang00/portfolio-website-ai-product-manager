"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  const calendlySrc =
    "https://calendly.com/umangthakkar005/30min" +
    "?hide_event_type_details=1&hide_gdpr_banner=1" +
    "&primary_color=16a34a&background_color=0b0b0b&text_color=ffffff"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        // bigger canvas
        className="w-[98vw] sm:max-w-[1280px] h-[92vh] p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>Schedule a Call with Umang</DialogTitle>
        </DialogHeader>

        {/* Calendly owns the rest */}
        <iframe
          src={calendlySrc}
          title="Schedule a call with Umang"
          className="h-[calc(92vh-60px)] w-full"
          allow="clipboard-write; fullscreen"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        />
      </DialogContent>
    </Dialog>
  )
}
