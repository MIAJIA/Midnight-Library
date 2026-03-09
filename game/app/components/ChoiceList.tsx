'use client';

import { useState } from 'react';
import type { Choice } from '@/app/types/game';

interface Props {
  choices: Choice[];
  onSelect: (key: 'A' | 'B' | 'C' | 'D', customText?: string) => void;
  disabled?: boolean;
}

export default function ChoiceList({ choices, onSelect, disabled }: Props) {
  const [customText, setCustomText] = useState('');

  const handlePreset = (key: 'A' | 'B' | 'C') => {
    if (disabled) return;
    onSelect(key);
  };

  const handleCustomSubmit = () => {
    if (disabled || !customText.trim()) return;
    onSelect('D', customText.trim());
    setCustomText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCustomSubmit();
  };

  return (
    <div className="choices">
      {choices.map((c) => (
        <button
          key={c.key}
          className="choice-btn"
          onClick={() => handlePreset(c.key)}
          disabled={disabled}
        >
          <span className="choice-key">{c.key}.</span>
          {c.text}
        </button>
      ))}

      <div className="choice-d">
        <span className="choice-key">D.</span>
        <span className="choice-d-label">其他：</span>
        <input
          className="choice-input"
          type="text"
          placeholder="输入你的选择…"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="自定义选项"
        />
        {customText.trim() && (
          <button
            className="choice-submit"
            onClick={handleCustomSubmit}
            disabled={disabled}
          >
            ↵
          </button>
        )}
      </div>
    </div>
  );
}
