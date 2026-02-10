import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { BookOpen, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockApi } from '@/api/mock-api';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { filterBySearch } from '@/lib/search';

export const SheetView = () => {
  const sheet = useSheetStore((s) => s.sheet);
  const topics = useSheetStore((s) => s.topics);
  const subTopics = useSheetStore((s) => s.subTopics);
  const topicOrder = useSheetStore((s) => s.topicOrder);
  const questions = useSheetStore((s) => s.questions);
  const isLoading = useSheetStore((s) => s.isLoading);
  const loadSheet = useSheetStore((s) => s.loadSheet);
  const addTopic = useSheetStore((s) => s.addTopic);
  const reorderTopics = useSheetStore((s) => s.reorderTopics);

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(
    () => filterBySearch({ topics, subTopics, questions, topicOrder }, searchQuery),
    [topics, subTopics, questions, topicOrder, searchQuery]
  );

  const isSearching = searchQuery.trim().length > 0;

  const displayOrder = isSearching && searchResults
    ? topicOrder.filter((id) => searchResults.visibleTopicIds.has(id))
    : topicOrder;

  const totalPages = Math.max(1, Math.ceil(displayOrder.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedOrder = isSearching
    ? displayOrder
    : displayOrder.slice(safePage * perPage, (safePage + 1) * perPage);

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

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const totalQuestions = Object.keys(questions).length;
  const totalSolved = Object.values(questions).filter(
    (q) => q.isSolved
  ).length;
  const totalTopics = topicOrder.length;

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
            <ThemeToggle />
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              aria-label="Reset sheet to defaults"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {topicOrder.length > 0 && (
            <div className="mt-4">
              <SearchBar
                onSearch={handleSearch}
                resultCount={searchResults ? searchResults.totalMatches : null}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {topicOrder.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Topics</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalTopics}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalQuestions}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Solved</p>
                <span className="text-xs font-semibold text-accent">
                  {totalQuestions > 0
                    ? Math.round((totalSolved / totalQuestions) * 100)
                    : 0}%
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {totalSolved}
                <span className="text-sm font-normal text-muted-foreground"> / {totalQuestions}</span>
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isSearching && searchResults && searchResults.totalMatches === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-muted-foreground" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No results found
            </h2>
            <p className="text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        ) : topicOrder.length === 0 ? (
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
              items={paginatedOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {paginatedOrder.map((id) => {
                  const topic = topics[id];
                  if (!topic) return null;
                  return (
                    <TopicSection
                      key={id}
                      topic={topic}
                      searchQuery={searchQuery}
                      searchResults={searchResults}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {topicOrder.length > 0 && !isSearching && (
          <div className="mt-6">
            <AddItemInline
              onAdd={addTopic}
              placeholder="Topic name..."
              buttonLabel="Add Topic"
            />
          </div>
        )}

        {topicOrder.length > 0 && !isSearching && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Topics per page:</span>
              {[10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => { setPerPage(n); setPage(0); }}
                  className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                    perPage === n
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Page {safePage + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 0}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages - 1}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
