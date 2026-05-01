// packages/frontend/components/dashboard/dashboard-grid.tsx
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DashboardWidgetType,
  type WidgetPositionInput,
  type DashboardWidgetDataMap,
} from "@mini-erp/shared";
import { useCallback } from "react";
import { WidgetRenderer } from "./widget-renderer";

interface DashboardGridProps {
  layout: WidgetPositionInput[];
  widgets: Partial<DashboardWidgetDataMap>;
  isEditMode: boolean;
  isLoading: boolean;
  onLayoutChange: (newLayout: WidgetPositionInput[]) => void;
}

/**
 * 12-column CSS grid dashboard with @dnd-kit drag-and-drop reordering.
 * Only visible widgets (visible: true OR layout from server) are rendered.
 */
export function DashboardGrid({
  layout,
  widgets,
  isEditMode,
  isLoading,
  onLayoutChange,
}: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Server layout doesn't always include `visible` — treat absence as visible
  const visibleLayout = layout.filter((w) => w.visible !== false);
  const ids = visibleLayout.map((w) => w.widgetType);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = visibleLayout.findIndex((w) => w.widgetType === active.id);
      const newIndex = visibleLayout.findIndex((w) => w.widgetType === over.id);
      const reordered = arrayMove(visibleLayout, oldIndex, newIndex);

      // Recalculate col/row positions based on new order (12-col flow)
      const COLS = 12;
      let col = 0;
      let row = 0;
      const repositioned = reordered.map((w) => {
        if (col + w.w > COLS) {
          col = 0;
          row += 1;
        }
        const result = { ...w, col, row };
        col += w.w;
        return result;
      });

      // Hidden widgets preserved at the end
      const hidden = layout.filter((w) => w.visible === false);
      onLayoutChange([...repositioned, ...hidden]);
    },
    [visibleLayout, layout, onLayoutChange],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy} disabled={!isEditMode}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
          {visibleLayout.map((widgetConfig) => (
            <SortableWidgetCell
              key={widgetConfig.widgetType}
              widgetConfig={widgetConfig}
              data={widgets[widgetConfig.widgetType]}
              isEditMode={isEditMode}
              isLoading={isLoading}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ─── Sortable cell ────────────────────────────────────────────────────────────

interface SortableWidgetCellProps {
  widgetConfig: WidgetPositionInput;
  data: Partial<DashboardWidgetDataMap>[DashboardWidgetType] | undefined;
  isEditMode: boolean;
  isLoading: boolean;
}

/**
 * Bridges @dnd-kit sortable state with CSS grid span positioning.
 */
function SortableWidgetCell({
  widgetConfig,
  data,
  isEditMode,
  isLoading,
}: SortableWidgetCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widgetConfig.widgetType,
    disabled: !isEditMode,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: `span ${widgetConfig.w}`,
        gridRow: `span ${widgetConfig.h}`,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 10 : "auto",
      }}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      <WidgetRenderer
        widgetType={widgetConfig.widgetType}
        data={data}
        isLoading={isLoading}
        isEditMode={isEditMode}
      />
    </div>
  );
}
