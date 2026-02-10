import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { QuestionRow } from './QuestionRow';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';
import { AddQuestionForm } from './AddQuestionForm';

export const SubTopicCard = ({ subTopic, topicId, searchQuery = '', searchResults = null }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeDragId, setActiveDragId] = useState(null);
  const questions = useSheetStore((s) => s.questions);
  const updateSubTopic = useSheetStore((s) => s.updateSubTopic);
  const deleteSubTopic = useSheetStore((s) => s.deleteSubTopic);
  const addQuestion = useSheetStore((s) => s.addQuestion);
  const reorderQuestions = useSheetStore((s) => s.reorderQuestions);

  const isSearching = searchQuery.trim().length > 0;
  const expanded = isSearching ? true : isExpanded;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subTopic.id, data: { type: 'subTopic', topicId } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const allQuestionList = subTopic.questionIds
    .map((id) => questions[id])
    .filter(Boolean);

  const questionList = isSearching && searchResults
    ? allQuestionList.filter((q) => searchResults.visibleQuestionIds.has(q.id))
    : allQuestionList;

  const solvedCount = allQuestionList.filter((q) => q.isSolved).length;

  const handleDragStart = (event) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subTopic.questionIds.indexOf(String(active.id));
    const newIndex = subTopic.questionIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    reorderQuestions(
      subTopic.id,
      arrayMove(subTopic.questionIds, oldIndex, newIndex)
    );
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const activeQuestion = activeDragId ? questions[activeDragId] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-border bg-card transition-all ${
        isDragging ? 'opacity-40 shadow-lg scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3 group">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Drag to reorder sub-topic"
        >
          <GripVertical size={14} />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <InlineEdit
            value={subTopic.name}
            onSave={(val) => updateSubTopic(subTopic.id, val)}
            className="text-sm font-semibold text-foreground"
            searchQuery={searchQuery}
          />
        </div>

        <span className="text-xs text-muted-foreground font-mono ml-auto mr-2 shrink-0">
          {solvedCount}/{allQuestionList.length}
        </span>

        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mr-2 hidden sm:block shrink-0">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{
              width: allQuestionList.length
                ? `${(solvedCount / allQuestionList.length) * 100}%`
                : '0%',
            }}
          />
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <DeleteConfirm
            onConfirm={() => deleteSubTopic(topicId, subTopic.id)}
            itemName="sub-topic"
            size={13}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {questionList.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center italic">
              {isSearching ? 'No matching questions' : 'No questions yet'}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={questionList.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  {questionList.map((q, i) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      subTopicId={subTopic.id}
                      index={i}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeQuestion && (
                  <div className="rounded-md border border-primary/40 bg-card shadow-xl px-3 py-2 flex items-center gap-2 opacity-90">
                    <GripVertical size={12} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{activeQuestion.title}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {!isSearching && (
            <div className="mt-2 pl-8">
              <AddQuestionForm
                onAdd={(data) => addQuestion(subTopic.id, data)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
