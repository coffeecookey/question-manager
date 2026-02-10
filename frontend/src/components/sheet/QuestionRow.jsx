import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, ExternalLink, Pencil, AlertTriangle } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { findDuplicateLocations } from '@/lib/duplicates';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';
import { EditQuestionForm } from './EditQuestionForm';

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-50/50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-700',
  Medium: 'bg-amber-50/50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700',
  Hard: 'bg-red-50/50 text-red-600 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-400 dark:ring-red-700',
  Unmarked: 'bg-slate-50/50 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
};

export const QuestionRow = ({ question, subTopicId, index, searchQuery = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleSolved = useSheetStore((s) => s.toggleSolved);
  const updateQuestion = useSheetStore((s) => s.updateQuestion);
  const deleteQuestion = useSheetStore((s) => s.deleteQuestion);

  const state = useSheetStore.getState();
  const urlDuplicates = findDuplicateLocations(state, question.problemUrl, question.id);
  const showDuplicateBadge = question.isDuplicate || urlDuplicates.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    data: { type: 'question', subTopicId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 px-3 py-2 rounded-md group hover:bg-muted/50 transition-all ${
          isDragging ? 'opacity-40 shadow-md z-10' : ''
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="drag-handle opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Drag to reorder question"
        >
          <GripVertical size={12} />
        </button>

        <span className="text-xs text-muted-foreground font-mono w-6 shrink-0 text-center">
          {index + 1}
        </span>

        <button
          onClick={() => toggleSolved(question.id)}
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            question.isSolved
              ? 'bg-accent border-accent'
              : 'border-muted-foreground/30 hover:border-accent'
          }`}
          aria-label={question.isSolved ? 'Mark as unsolved' : 'Mark as solved'}
        >
          {question.isSolved && <Check size={12} className="text-accent-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <InlineEdit
            value={question.title}
            onSave={(val) => updateQuestion(question.id, { title: val })}
            className={`text-sm ${
              question.isSolved
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
            searchQuery={searchQuery}
          />
        </div>

        {showDuplicateBadge && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-medium shrink-0">
            <AlertTriangle size={10} />
            Duplicate
          </span>
        )}

        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${
            DIFFICULTY_STYLES[question.difficulty] || 'bg-muted text-muted-foreground'
          }`}
        >
          {question.difficulty}
        </span>

        {question.problemUrl && (
          <a
            href={question.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="Open problem link"
          >
            <ExternalLink size={13} />
          </a>
        )}

        {question.resource && (
          <a
            href={question.resource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/70 hover:text-primary shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded font-medium"
            aria-label="Open resource link"
          >
            Video
          </a>
        )}

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Edit question"
        >
          <Pencil size={13} />
        </button>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <DeleteConfirm
            onConfirm={() => deleteQuestion(subTopicId, question.id)}
            itemName="question"
            size={13}
          />
        </div>
      </div>

      {isEditing && (
        <div className="px-3">
          <EditQuestionForm
            question={question}
            onClose={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
};
