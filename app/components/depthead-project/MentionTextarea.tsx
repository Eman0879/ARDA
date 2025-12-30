// app/components/depthead-project/MentionTextarea.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

interface TeamMember {
  username: string;
  displayName: string;
  email: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder: string;
  teamMembers: TeamMember[];
  rows?: number;
  disabled?: boolean;
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  teamMembers,
  rows = 3,
  disabled = false
}: MentionTextareaProps) {
  const { colors } = useTheme();
  const [dropdown, setDropdown] = useState({
    show: false,
    query: '',
    left: 0,
    top: 0
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const extractMentions = (text: string): string[] => {
    const regex = /@\[([^\]]+)\]/g;
    const mentions: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && !disabled) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        const coords = getCaretCoordinates(e.target, cursor);
        setDropdown({
          show: true,
          query: afterAt.toLowerCase(),
          left: coords.left,
          top: coords.top
        });
      } else {
        setDropdown({ show: false, query: '', left: 0, top: 0 });
      }
    } else {
      setDropdown({ show: false, query: '', left: 0, top: 0 });
    }

    const mentions = extractMentions(text);
    onChange(text, mentions);
  };

  const insertMention = (member: TeamMember) => {
    if (!textareaRef.current) return;
    
    const cursor = textareaRef.current.selectionStart;
    const textBefore = value.slice(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');
    
    const newText = 
      value.slice(0, lastAt) + 
      `@[${member.username}] ` + 
      value.slice(cursor);

    const mentions = extractMentions(newText);
    onChange(newText, mentions);
    setDropdown({ show: false, query: '', left: 0, top: 0 });
    
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = getComputedStyle(element);
    
    [...style].forEach(prop => {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    
    div.textContent = element.value.substring(0, position);
    document.body.appendChild(div);
    
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    
    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft
    };
    
    document.body.removeChild(div);
    return coordinates;
  };

  // Fixed filtering logic with null/undefined checks
  const filteredMembers = teamMembers.filter(m => {
    // Ensure all required properties exist
    if (!m || !m.displayName || !m.username) return false;
    
    const displayName = m.displayName.toLowerCase();
    const username = m.username.toLowerCase();
    const query = dropdown.query.toLowerCase();
    
    return displayName.includes(query) || username.includes(query);
  });

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} ${colors.inputFocusBg} focus:ring-opacity-50 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />

      {dropdown.show && (
        <div
          className={`absolute z-50 w-64 rounded-xl ${colors.shadowDropdown} border max-h-48 overflow-y-auto backdrop-blur-md ${colors.dropdownBg} ${colors.dropdownBorder}`}
          style={{
            top: `${dropdown.top + 25}px`,
            left: `${dropdown.left}px`
          }}
        >
          {filteredMembers.length === 0 ? (
            <div className={`p-3 text-sm ${colors.textMuted}`}>
              No members found
            </div>
          ) : (
            filteredMembers.map(member => (
              <button
                key={member.username}
                onClick={() => insertMention(member)}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${colors.dropdownHover} ${colors.dropdownText}`}
              >
                <div className={`font-semibold ${colors.textPrimary}`}>{member.displayName}</div>
                <div className={`text-xs ${colors.textMuted}`}>
                  @{member.username}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}