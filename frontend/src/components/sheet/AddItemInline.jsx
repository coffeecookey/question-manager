import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export const AddItemInline = ({ onAdd, placeholder = 'Name...', buttonLabel = 'Add' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setText('');
      setIsAdding(false);
    }
  };

  const handleBlur = (e) => {
    if (e.relatedTarget?.dataset?.addAction) return;
    if (!text.trim()) {
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <Plus size={14} />
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 text-sm bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 transition-colors"
        maxLength={200}
      />
      <button
        data-add-action="true"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-0.5"
      >
        Add
      </button>
      <button
        data-add-action="true"
        onClick={() => { setText(''); setIsAdding(false); }}
        className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <X size={14} />
      </button>
    </div>
  );
};
