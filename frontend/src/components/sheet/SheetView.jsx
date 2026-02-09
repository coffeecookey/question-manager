import { useEffect } from 'react';
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
import { useSheetStore } from '@/store/useSheetStore';
import { TopicSection } from './TopicSection';
import { AddItemInline } from './AddItemInline';
import { BookOpen, Loader2, RotateCcw } from 'lucide-react';
import { mockApi } from '@/api/mock-api';
import { toast } from 'sonner';

export const SheetView = () => {
  const sheet = useSheetStore((s) => s.sheet);
  const topics = useSheetStore((s) => s.topics);
  const topicOrder = useSheetStore((s) => s.topicOrder);
  const questions = useSheetStore((s) => s.questions);
  const subTopics = useSheetStore((s) => s.subTopics);
  const isLoading = useSheetStore((s) => s.isLoading);
  const loadSheet = useSheetStore((s) => s.loadSheet);
  const addTopic = useSheetStore((s) => s.addTopic);
  const reorderTopics = useSheetStore((s) => s.reorderTopics);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topicOrder.indexOf(String(active.id));
    const newIndex = topicOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    reorderTopics(arrayMove(topicOrder, oldIndex, newIndex));
  };

  const handleReset = async () => {
    await mockApi.resetData();
    loadSheet();
    toast.success('Sheet reset to defaults');
  };

  const totalQuestions = Object.keys(questions).length;
  const totalSolved = Object.values(questions).filter(
    (q) => q.isSolved
  ).length;
  const totalTopics = topicOrder.length;
  const totalSubTopics = Object.keys(subTopics).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg font-medium">Loading sheet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="text-primary" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">
                {sheet?.name || 'Question Sheet'}
              </h1>
              {sheet?.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {sheet.description}
                </p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              aria-label="Reset sheet to defaults"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-3 text-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">{totalTopics}</span>
              <span className="text-muted-foreground">topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">
                {totalSubTopics}
              </span>
              <span className="text-muted-foreground">sub-topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">
                {totalQuestions}
              </span>
              <span className="text-muted-foreground">questions</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-bold text-accent">
                {totalSolved}
              </span>
              <span className="text-muted-foreground">
                / {totalQuestions} solved
              </span>
            </div>
            {totalQuestions > 0 && (
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{
                    width: `${(totalSolved / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {topicOrder.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen
                className="text-muted-foreground"
                size={28}
              />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No topics yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first topic to start building your
              question sheet.
            </p>
            <AddItemInline
              onAdd={addTopic}
              placeholder="Topic name..."
              buttonLabel="Add your first topic"
            />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={topicOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {topicOrder.map((id) => {
                  const topic = topics[id];
                  if (!topic) return null;
                  return (
                    <TopicSection key={id} topic={topic} />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {topicOrder.length > 0 && (
          <div className="mt-6">
            <AddItemInline
              onAdd={addTopic}
              placeholder="Topic name..."
              buttonLabel="Add Topic"
            />
          </div>
        )}
      </main>
    </div>
  );
};
