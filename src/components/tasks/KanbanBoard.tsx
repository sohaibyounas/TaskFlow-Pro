"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { useTasksByStatus } from "@/hooks/useTasksByStatus";
import { useUpdateTask } from "@/hooks/useTaskMutations";
import { taskKeys } from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCardSkeleton } from "./TaskCardSkeleton";

export function KanbanBoard() {
  const { columns, isLoading, isError } = useTasksByStatus();
  const updateTaskMutation = useUpdateTask();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // desktop: 8px move ke baad drag start
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,      // mobile: 250ms hold karo tab drag start ho
        tolerance: 5,    // thodi si movement allow karo (scroll se bachao)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    // Abhi ke liye khali chhoda — agar cross-column drag ke beech mein
    // preview chahiye ho to yahan cache manually update kar sakte ho.
    // Humne simplicity ke liye sara logic handleDragEnd mein rakha hai.
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return; // kahin bhi drop nahi hua (board se bahar)

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // over.id ya to ek column ka status hoga, ya kisi doosre task ka id
    const allTasks = columns.flatMap((c) => c.tasks);
    const draggedTask = allTasks.find((t) => t.id === activeTaskId);
    if (!draggedTask) return;

    // Target status pata karo — agar over.id ek valid status hai to wahi,
    // warna jis task pe drop hua uska status le lo
    const validStatuses: TaskStatus[] = [
      "todo",
      "in-progress",
      "review",
      "done",
    ];
    const targetStatus = validStatuses.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : allTasks.find((t) => t.id === overId)?.status;

    if (!targetStatus || targetStatus === draggedTask.status) return;

    // 🎯 Yahi mutation call hoti hai — optimistic update automatically
    // chal jayega humare useUpdateTask hook ki wajah se
    updateTaskMutation.mutate({
      id: activeTaskId,
      input: { status: targetStatus },
    });
  }

  //   if (isLoading)
  //     return <TaskCardSkeleton />;
  if (isError)
    return <p className="text-sm text-red-600">Board load nahi hua.</p>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners} // sabse nazdeek wala drop target detect karta hai
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full min-h-0 gap-4 overflow-x-auto p-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((colIndex) => (
              <div
                key={colIndex}
                className="flex w-80 flex-shrink-0 flex-col rounded-xl bg-gray-50 p-4 border border-gray-100"
              >
                <div className="flex flex-col gap-3">
                  {[1].map((cardIndex) => (
                    <TaskCardSkeleton key={cardIndex} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          columns.map((column) => (
            <TaskColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={column.tasks}
            />
          ))
        )}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
