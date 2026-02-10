import { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { findDuplicateLocations } from '@/lib/duplicates';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_BUTTON_STYLES = {
  Easy: 'bg-emerald-50/70 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-700',
  Medium: 'bg-amber-50/70 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700',
  Hard: 'bg-red-50/70 text-red-600 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-400 dark:ring-red-700',
};

export const EditQuestionForm = ({ question, onClose }) => {
  const [title, setTitle] = useState(question.title);
  const [problemUrl, setProblemUrl] = useState(question.problemUrl || '');
  const [resource, setResource] = useState(question.resource || '');
  const [difficulty, setDifficulty] = useState(question.difficulty || 'Unmarked');
  const [isDuplicate, setIsDuplicate] = useState(question.isDuplicate || false);
  const titleRef = useRef(null);

  const updateQuestion = useSheetStore((s) => s.updateQuestion);

  const state = useSheetStore.getState();
  const duplicateLocations = findDuplicateLocations(state, problemUrl, question.id);
  const hasUrlDuplicates = duplicateLocations.length > 0;

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    updateQuestion(question.id, {
      title: trimmedTitle,
      problemUrl: problemUrl.trim(),
      resource: resource.trim(),
      difficulty: difficulty || 'Unmarked',
      isDuplicate,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-3 mt-1 mb-2">
      {(hasUrlDuplicates || isDuplicate) && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 rounded-md px-3 py-2">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Duplicate question.</span>
            {hasUrlDuplicates && (
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
            )}
            {isDuplicate && !hasUrlDuplicates && (
              <span> Manually marked as duplicate.</span>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          Question Title
        </label>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
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
              onClick={() => setDifficulty(difficulty === d ? 'Unmarked' : d)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                difficulty === d
                  ? DIFFICULTY_BUTTON_STYLES[d]
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDuplicate}
            onChange={(e) => setIsDuplicate(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-border accent-amber-500"
          />
          <span className="text-xs text-muted-foreground">Mark as duplicate</span>
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground px-4 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
