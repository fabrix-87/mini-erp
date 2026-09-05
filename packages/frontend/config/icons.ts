// config/icons.ts
import {
  Plus,
  Pencil,
  Trash2,
  Trash,
  Download,
  Eye,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trophy,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Registry of all Lucide icons used in the application.
 * Add icons here as needed — only imported icons are bundled.
 */
export const iconRegistry = {
  plus: Plus,
  pencil: Pencil,
  "trash-2": Trash2,
  trash: Trash,
  download: Download,
  eye: Eye,
  search: Search,
  filter: Filter,
  x: X,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "more-horizontal": MoreHorizontal,
  trophy: Trophy,
  "x-circle": XCircle,
} as const satisfies Record<string, LucideIcon>;

/** Union type delle sole icone registrate — type-safe e leggera. */
export type AppIconName = keyof typeof iconRegistry;
