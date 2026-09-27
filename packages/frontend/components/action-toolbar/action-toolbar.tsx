// components/action-toolbar/action-toolbar.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ActionToolbarProps } from "@/types/ui-types";
import { ActionToolbarButton } from "./action-toolbar-button";
import { ActionToolbarOverlay } from "./action-toolbar-overlay";

const ALIGN_CLASS: Record<NonNullable<ActionToolbarProps["align"]>, string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

/**
 * Generic, declarative toolbar of action buttons.
 *
 * Each button in `buttons` independently runs a handler (`action`),
 * navigates (`href`), or opens a `Dialog` (`modal`) / `Sheet` (`sheet`).
 * At most one modal/sheet overlay is mounted at a time. All visible text
 * is supplied as next-intl translation keys and resolved internally.
 *
 * @param props - Button configs, alignment, and container class.
 * @returns The rendered toolbar and its active overlay, if any.
 *
 * @example
 * <ActionToolbar
 *   ariaLabelKey="companies.toolbar.ariaLabel"
 *   buttons={[
 *     { type: "action", key: "export", labelKey: "companies.toolbar.export", icon: Download, onClick: exportCsv },
 *     { type: "href", key: "docs", labelKey: "companies.toolbar.docs", icon: FileText, href: "/crm/documents" },
 *     { type: "modal", key: "new", labelKey: "companies.toolbar.new", icon: Plus, content: <CompanyForm /> },
 *     {
 *       type: "action",
 *       key: "delete",
 *       labelKey: "companies.toolbar.delete",
 *       variant: "destructive",
 *       icon: Trash2,
 *       onClick: deleteCompany,
 *       confirm: {
 *         titleKey: "companies.toolbar.deleteConfirmTitle",
 *         descriptionKey: "companies.toolbar.deleteConfirmDescription",
 *         destructive: true,
 *       },
 *     },
 *   ]}
 * />
 */
export function ActionToolbar({
  buttons,
  className,
  align = "end",
  ariaLabelKey,
}: ActionToolbarProps): React.JSX.Element {
  const t = useTranslations();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeButton = buttons.find((button) => button.key === activeKey && !button.hidden);

  return (
    <>
      <div
        role="toolbar"
        aria-label={t(ariaLabelKey)}
        className={cn("flex flex-wrap items-center gap-2 py-3", ALIGN_CLASS[align], className)}
      >
        {buttons.map((button) => (
          <ActionToolbarButton key={button.key} config={button} onOpenOverlay={setActiveKey} />
        ))}
      </div>
      <ActionToolbarOverlay activeButton={activeButton} onClose={() => setActiveKey(null)} />
    </>
  );
}
