import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ onSearch, resultCount }) => {
  const [input, setInput] = useState('');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(input);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input, onSearch]);

  const handleClear = () => {
    setInput('');
    onSearch('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search topics, sub-topics, questions..."
          className="w-full text-sm bg-card border border-border rounded-lg pl-9 pr-9 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/60"
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {input.trim() && resultCount !== null && (
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          {resultCount === 0
            ? 'No results found'
            : `${resultCount} match${resultCount !== 1 ? 'es' : ''} found`}
        </p>
      )}
    </div>
  );
};
