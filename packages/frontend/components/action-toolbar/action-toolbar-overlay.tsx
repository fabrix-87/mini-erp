// components/action-toolbar/action-toolbar-overlay.tsx
"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ToolbarButtonConfig, ToolbarOverlayControls } from "@/types/ui-types";

interface ActionToolbarOverlayProps {
  /** The single button config whose modal/sheet is currently active, if any. */
  activeButton: ToolbarButtonConfig | undefined;
  /** Called when the overlay should close (backdrop click, Esc, action done). */
  onClose: () => void;
}

/**
 * Renders at most one Dialog or Sheet at a time, matching the button
 * configuration currently marked as active by `ActionToolbar`.
 *
 * Content is resolved lazily: if `content` is a function, it is only
 * invoked while the overlay is open, avoiding unnecessary mounts. Title
 * and description are next-intl translation keys, resolved with the root
 * `useTranslations()`.
 *
 * @param props - Active button config and close callback.
 * @returns The Dialog/Sheet markup, or `null` when nothing is open.
 */
export function ActionToolbarOverlay({
  activeButton,
  onClose,
}: ActionToolbarOverlayProps): React.JSX.Element | null {
  const t = useTranslations();
  if (!activeButton) return null;

  const controls: ToolbarOverlayControls = {
    open: true,
    onOpenChange: (open: boolean): void => {
      if (!open) onClose();
    },
  };

  if (activeButton.type === "modal") {
    if (activeButton.mode === "custom") {
      return <>{activeButton.renderModal(controls)}</>;
    }

    return (
      <Dialog open onOpenChange={controls.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(activeButton.modalTitleKey)}</DialogTitle>
            {activeButton.modalDescriptionKey && (
              <DialogDescription>{t(activeButton.modalDescriptionKey)}</DialogDescription>
            )}
          </DialogHeader>
          {activeButton.content}
        </DialogContent>
      </Dialog>
    );
  }

  if (activeButton.type === "sheet") {
    if (activeButton.mode === "custom") {
      return <>{activeButton.renderSheet(controls)}</>;
    }

    return (
      <Sheet open onOpenChange={controls.onOpenChange}>
        <SheetContent side={activeButton.side ?? "right"}>
          <SheetHeader>
            <SheetTitle>{t(activeButton.sheetTitleKey)}</SheetTitle>
            {activeButton.sheetDescriptionKey && (
              <SheetDescription>{t(activeButton.sheetDescriptionKey)}</SheetDescription>
            )}
          </SheetHeader>
          {activeButton.content}
        </SheetContent>
      </Sheet>
    );
  }

  return null;
}
