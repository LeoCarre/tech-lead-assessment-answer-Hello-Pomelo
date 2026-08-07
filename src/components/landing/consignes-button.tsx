"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConsignesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <FileText className="size-4" />
        Afficher les consignes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] w-[min(96vw,1100px)] max-w-none flex-col gap-3 overflow-hidden p-4 sm:max-w-none">
          <DialogHeader>
            <DialogTitle>Consignes - Tech Lead Assessment</DialogTitle>
            <DialogDescription>
              Document officiel du test technique.{" "}
              <a
                href="/consignes.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-secondary underline-offset-4 hover:underline"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </DialogDescription>
          </DialogHeader>
          <iframe
            title="Consignes PDF"
            src="/consignes.pdf"
            className="bg-muted min-h-0 w-full flex-1 rounded-md border"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
