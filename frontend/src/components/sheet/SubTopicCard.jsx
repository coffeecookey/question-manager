import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
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
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { QuestionRow } from './QuestionRow';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';
import { AddQuestionForm } from './AddQuestionForm';

export const SubTopicCard = ({ subTopic, topicId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const questions = useSheetStore((s) => s.questions);
  const updateSubTopic = useSheetStore((s) => s.updateSubTopic);
  const deleteSubTopic = useSheetStore((s) => s.deleteSubTopic);
  const addQuestion = useSheetStore((s) => s.addQuestion);
  const reorderQuestions = useSheetStore((s) => s.reorderQuestions);

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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const questionList = subTopic.questionIds
    .map((id) => questions[id])
    .filter(Boolean);

  const solvedCount = questionList.filter((q) => q.isSolved).length;

  const handleDragEnd = (event) => {
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
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
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
          />
        </div>

        <span className="text-xs text-muted-foreground font-mono ml-auto mr-2 shrink-0">
          {solvedCount}/{questionList.length}
        </span>

        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mr-2 hidden sm:block shrink-0">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{
              width: questionList.length
                ? `${(solvedCount / questionList.length) * 100}%`
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

      {isExpanded && (
        <div className="px-3 pb-3">
          {questionList.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center italic">
              No questions yet
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={subTopic.questionIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  {questionList.map((q, i) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      subTopicId={subTopic.id}
                      index={i}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="mt-2 pl-8">
            <AddQuestionForm
              onAdd={(data) => addQuestion(subTopic.id, data)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
