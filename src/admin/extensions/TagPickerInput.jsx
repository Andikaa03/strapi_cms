import React, { useState, useEffect, useRef } from 'react';

const TagPickerInput = ({ name, value, onChange, disabled, error }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [initialized, setInitialized] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch all existing tags once on mount
  useEffect(() => {
    fetch('/api/tag-names', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setAllTags((data?.data || []).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  // Parse value from the field prop (populated by afterFindOne lifecycle)
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    if (typeof value === 'string' && value.trim()) {
      const names = value
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
      setSelectedTags(names);
    }
  }, [value, initialized]);

  // Filter suggestions based on current input
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const q = inputValue.toLowerCase().trim();
    const filtered = allTags.filter(
      (t) =>
        t.toLowerCase().includes(q) &&
        !selectedTags.some((s) => s.toLowerCase() === t.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
    setShowDropdown(true);
    setHighlightIndex(-1);
  }, [inputValue, allTags, selectedTags]);

  const emitChange = (newTags) => {
    if (typeof onChange === 'function') {
      onChange({ target: { name, type: 'text', value: newTags.join(', ') } });
    }
  };

  const addTag = (tagName) => {
    const normalized = tagName.trim();
    if (!normalized) return;
    if (selectedTags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      setInputValue('');
      setShowDropdown(false);
      return;
    }
    const newTags = [...selectedTags, normalized];
    setSelectedTags(newTags);
    setAllTags((current) => {
      if (current.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
        return current;
      }

      return [...current, normalized].sort((left, right) => left.localeCompare(right));
    });
    emitChange(newTags);
    setInputValue('');
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeTag = (index) => {
    const newTags = selectedTags.filter((_, i) => i !== index);
    setSelectedTags(newTags);
    emitChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        addTag(suggestions[highlightIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length) {
      removeTag(selectedTags.length - 1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const showCreateNew =
    inputValue.trim() &&
    !allTags.some((t) => t.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !selectedTags.some((t) => t.toLowerCase() === inputValue.trim().toLowerCase());

  const borderColor = error ? '#d02b20' : showDropdown ? '#4945ff' : '#32324d';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          marginBottom: '8px',
          color: '#f6f6ff',
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: 1.33,
        }}
      >
        Tags
      </div>

      {/* Tag chips + text input */}
      <div
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: showDropdown ? '4px 4px 0 0' : '4px',
          minHeight: '40px',
          padding: '4px 8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignItems: 'center',
          backgroundColor: disabled ? '#1c1c31' : '#212134',
          cursor: disabled ? 'default' : 'text',
          transition: 'border-color 0.15s',
        }}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selectedTags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px 2px 8px',
              borderRadius: '2px',
              backgroundColor: '#4945ff',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              maxWidth: '220px',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </span>
            {!disabled && (
              <button
                type="button"
                style={{
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  padding: '0 2px',
                  fontSize: '15px',
                  lineHeight: 1,
                  opacity: 0.75,
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#f6f6ff',
            fontSize: '14px',
            outline: 'none',
            minWidth: '150px',
            height: '28px',
            flex: 1,
          }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim() && suggestions.length) setShowDropdown(true);
          }}
          disabled={disabled}
          placeholder={
            selectedTags.length === 0 ? 'Type to search tags, or type a new tag and press Enter...' : ''
          }
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (suggestions.length > 0 || showCreateNew) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
            backgroundColor: '#212134',
            border: '1px solid #4945ff',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '220px',
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={s}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#f6f6ff',
                fontSize: '14px',
                backgroundColor: i === highlightIndex ? '#272750' : 'transparent',
                borderBottom: '1px solid #1c1c31',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {s}
            </div>
          ))}

          {showCreateNew && (
            <div
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#7b79ff',
                fontSize: '13px',
                fontStyle: 'italic',
                borderTop: suggestions.length ? '1px solid #32324d' : 'none',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(inputValue.trim());
              }}
            >
              + Create new tag &quot;{inputValue.trim()}&quot;
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#d02b20', margin: '4px 0 0 2px' }}>{error}</p>
      )}
    </div>
  );
};

export default TagPickerInput;
