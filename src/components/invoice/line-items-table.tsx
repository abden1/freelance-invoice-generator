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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LineItem } from "@/hooks/use-invoice-builder";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SortableRowProps {
  item: LineItem;
  currency: string;
  onUpdate: (id: string, field: keyof Omit<LineItem, "id">, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function SortableRow({ item, currency, onUpdate, onRemove, canRemove }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const amount = (item.quantity || 0) * (item.rate || 0);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b transition-colors last:border-0",
        isDragging && "opacity-50 bg-muted"
      )}
    >
      {/* Drag Handle */}
      <td className="w-8 px-2 py-2">
        <button
          className="flex items-center justify-center h-full text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Description */}
      <td className="px-2 py-2">
        <Input
          value={item.description}
          onChange={(e) => onUpdate(item.id, "description", e.target.value)}
          placeholder="Item description..."
          className="h-8 text-sm border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0"
        />
      </td>

      {/* Quantity */}
      <td className="w-24 px-2 py-2">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={item.quantity || ""}
          onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
          placeholder="1"
          className="h-8 text-sm text-center border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0"
        />
      </td>

      {/* Rate */}
      <td className="w-32 px-2 py-2">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={item.rate || ""}
          onChange={(e) => onUpdate(item.id, "rate", e.target.value)}
          placeholder="0.00"
          className="h-8 text-sm text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0"
        />
      </td>

      {/* Amount */}
      <td className="w-28 px-2 py-2 text-right text-sm font-medium">
        {formatCurrency(amount, currency)}
      </td>

      {/* Delete */}
      <td className="w-10 px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.id)}
          disabled={!canRemove}
          type="button"
          aria-label="Remove item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

interface LineItemsTableProps {
  items: LineItem[];
  currency?: string;
  onUpdate: (id: string, field: keyof Omit<LineItem, "id">, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function LineItemsTable({
  items,
  currency = "USD",
  onUpdate,
  onRemove,
  onAdd,
  onReorder,
}: LineItemsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">
                Description
              </th>
              <th className="w-24 px-2 py-2 text-center font-medium text-muted-foreground">
                Qty
              </th>
              <th className="w-32 px-2 py-2 text-right font-medium text-muted-foreground">
                Rate
              </th>
              <th className="w-28 px-2 py-2 text-right font-medium text-muted-foreground">
                Amount
              </th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    canRemove={items.length > 1}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>

      <div className="border-t p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add line item
        </Button>
      </div>
    </div>
  );
}
