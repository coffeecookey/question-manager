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
import { SubTopicCard } from './SubTopicCard';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';
import { AddItemInline } from './AddItemInline';

export const TopicSection = ({ topic, searchQuery = '', searchResults = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const subTopics = useSheetStore((s) => s.subTopics);
  const questions = useSheetStore((s) => s.questions);
  const updateTopic = useSheetStore((s) => s.updateTopic);
  const deleteTopic = useSheetStore((s) => s.deleteTopic);
  const addSubTopic = useSheetStore((s) => s.addSubTopic);
  const reorderSubTopics = useSheetStore((s) => s.reorderSubTopics);

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
  } = useSortable({ id: topic.id, data: { type: 'topic' } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const allSubTopicList = topic.subTopicIds
    .map((id) => subTopics[id])
    .filter(Boolean);

  const subTopicList = isSearching && searchResults
    ? allSubTopicList.filter((st) => searchResults.visibleSubTopicIds.has(st.id))
    : allSubTopicList;

  const totalQuestions = allSubTopicList.reduce(
    (sum, st) => sum + st.questionIds.length,
    0
  );

  const totalSolved = allSubTopicList.reduce((sum, st) => {
    return (
      sum +
      st.questionIds.filter((qId) => questions[qId]?.isSolved).length
    );
  }, 0);

  const handleDragStart = (event) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
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

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const activeSubTopic = activeDragId ? subTopics[activeDragId] : null;

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
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
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
            searchQuery={searchQuery}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">
            {allSubTopicList.length} sub-topic{allSubTopicList.length !== 1 ? 's' : ''}
          </span>
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

      {expanded && (
        <div className="px-4 pb-4">
          {subTopicList.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center italic">
              {isSearching ? 'No matching sub-topics' : 'No sub-topics yet. Add one to get started.'}
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
                items={subTopicList.map((st) => st.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {subTopicList.map((st) => (
                    <SubTopicCard
                      key={st.id}
                      subTopic={st}
                      topicId={topic.id}
                      searchQuery={searchQuery}
                      searchResults={searchResults}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeSubTopic && (
                  <div className="rounded-lg border border-primary/40 bg-card shadow-xl px-4 py-3 flex items-center gap-2 opacity-90">
                    <GripVertical size={14} className="text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{activeSubTopic.name}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {!isSearching && (
            <div className="mt-3 pl-6">
              <AddItemInline
                onAdd={(name) => addSubTopic(topic.id, name)}
                placeholder="Sub-topic name..."
                buttonLabel="Add Sub-topic"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
