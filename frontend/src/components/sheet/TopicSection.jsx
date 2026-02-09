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
import { SubTopicCard } from './SubTopicCard';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';
import { AddItemInline } from './AddItemInline';

export const TopicSection = ({ topic }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const subTopics = useSheetStore((s) => s.subTopics);
  const questions = useSheetStore((s) => s.questions);
  const updateTopic = useSheetStore((s) => s.updateTopic);
  const deleteTopic = useSheetStore((s) => s.deleteTopic);
  const addSubTopic = useSheetStore((s) => s.addSubTopic);
  const reorderSubTopics = useSheetStore((s) => s.reorderSubTopics);

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
  } = useSortable({ id: topic.id, data: { type: 'topic' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subTopicList = topic.subTopicIds
    .map((id) => subTopics[id])
    .filter(Boolean);

  const totalQuestions = subTopicList.reduce(
    (sum, st) => sum + st.questionIds.length,
    0
  );

  const totalSolved = subTopicList.reduce((sum, st) => {
    return (
      sum +
      st.questionIds.filter((qId) => questions[qId]?.isSolved).length
    );
  }, 0);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topic.subTopicIds.indexOf(String(active.id));
    const newIndex = topic.subTopicIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    reorderSubTopics(
      topic.id,
      arrayMove(topic.subTopicIds, oldIndex, newIndex)
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-border bg-card shadow-sm transition-all ${
        isDragging ? 'opacity-40 shadow-xl scale-[1.005]' : ''
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-4 group">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Drag to reorder topic"
        >
          <GripVertical size={16} />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <InlineEdit
            value={topic.name}
            onSave={(val) => updateTopic(topic.id, val)}
            className="text-base font-bold text-foreground"
            as="h2"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            {totalSolved}/{totalQuestions} solved
          </span>

          <div className="relative w-8 h-8 hidden sm:block">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                strokeWidth="3"
                className="stroke-muted"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                strokeWidth="3"
                className="stroke-accent"
                strokeLinecap="round"
                strokeDasharray={`${
                  totalQuestions
                    ? (totalSolved / totalQuestions) * 94.2
                    : 0
                } 94.2`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
              {totalQuestions
                ? Math.round((totalSolved / totalQuestions) * 100)
                : 0}
              %
            </span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DeleteConfirm
              onConfirm={() => deleteTopic(topic.id)}
              itemName="topic"
              size={14}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          {subTopicList.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center italic">
              No sub-topics yet. Add one to get started.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={topic.subTopicIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {subTopicList.map((st) => (
                    <SubTopicCard
                      key={st.id}
                      subTopic={st}
                      topicId={topic.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="mt-3 pl-6">
            <AddItemInline
              onAdd={(name) => addSubTopic(topic.id, name)}
              placeholder="Sub-topic name..."
              buttonLabel="Add Sub-topic"
            />
          </div>
        </div>
      )}
    </div>
  );
};
