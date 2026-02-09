import { useState, useRef, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { findDuplicateLocations } from '@/lib/duplicates';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const AddQuestionForm = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [problemUrl, setProblemUrl] = useState('');
  const [resource, setResource] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (isAdding && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isAdding]);

  const reset = () => {
    setTitle('');
    setProblemUrl('');
    setResource('');
    setDifficulty('');
    setIsAdding(false);
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAdd({
      title: trimmedTitle,
      problemUrl: problemUrl.trim(),
      resource: resource.trim(),
      difficulty: difficulty || 'Neutral',
    });

    setTitle('');
    setProblemUrl('');
    setResource('');
    setDifficulty('');
    if (titleRef.current) titleRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      reset();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <Plus size={14} />
        Add Question
      </button>
    );
  }

  const state = useSheetStore.getState();
  const duplicateLocations = findDuplicateLocations(state, problemUrl.trim());
  const hasDuplicates = duplicateLocations.length > 0;

  return (
    <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Question Title
        </label>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Two Sum"
          className="w-full text-sm bg-card border border-border rounded-md px-3 py-1.5 outline-none focus:border-primary transition-colors"
          maxLength={200}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Problem Link
        </label>
        <input
          value={problemUrl}
          onChange={(e) => setProblemUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://leetcode.com/problems/..."
          className="w-full text-sm bg-card border border-border rounded-md px-3 py-1.5 outline-none focus:border-primary transition-colors"
        />
      </div>

      {hasDuplicates && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Duplicate detected.</span>
            <span>
              {' '}This question already exists in:
              {duplicateLocations.map((loc, i) => (
                <span key={loc.questionId}>
                  {i > 0 && ','}{' '}
                  <span className="font-medium">{loc.topicName}</span>
                  {' > '}
                  <span className="font-medium">{loc.subTopicName}</span>
                  {' '}({loc.title})
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Video Solution Link
        </label>
        <input
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://youtu.be/..."
          className="w-full text-sm bg-card border border-border rounded-md px-3 py-1.5 outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Difficulty
        </label>
        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(difficulty === d ? '' : d)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                difficulty === d
                  ? d === 'Easy'
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                    : d === 'Medium'
                    ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                    : 'bg-red-100 text-red-700 ring-1 ring-red-300'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {d}
            </button>
          ))}
          {difficulty && (
            <button
              onClick={() => setDifficulty('')}
              className="text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              Clear
            </button>
          )}
        </div>
        {!difficulty && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Will be marked as Neutral if not selected
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground px-4 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Add Question
        </button>
        <button
          onClick={reset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
