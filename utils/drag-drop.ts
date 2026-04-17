export interface DragState {
  draggedIndex: number | null;
  overIndex: number | null;
}

export function reorderArray<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function handleDragStart(
  index: number,
  setDragState: (state: DragState) => void
) {
  setDragState({ draggedIndex: index, overIndex: null });
}

export function handleDragOver(
  e: React.DragEvent,
  index: number,
  dragState: DragState,
  setDragState: (state: DragState) => void
) {
  e.preventDefault();
  if (dragState.draggedIndex !== null && dragState.overIndex !== index) {
    setDragState({ ...dragState, overIndex: index });
  }
}

export function handleDrop<T>(
  e: React.DragEvent,
  dragState: DragState,
  array: T[],
  setArray: (array: T[]) => void,
  setDragState: (state: DragState) => void
) {
  e.preventDefault();
  if (
    dragState.draggedIndex !== null &&
    dragState.overIndex !== null &&
    dragState.draggedIndex !== dragState.overIndex
  ) {
    const reordered = reorderArray(
      array,
      dragState.draggedIndex,
      dragState.overIndex
    );
    setArray(reordered);
  }
  setDragState({ draggedIndex: null, overIndex: null });
}

export function handleDragEnd(
  setDragState: (state: DragState) => void
) {
  setDragState({ draggedIndex: null, overIndex: null });
}

