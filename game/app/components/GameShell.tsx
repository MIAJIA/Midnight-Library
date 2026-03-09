'use client';

import { useState } from 'react';
import StatsBar from './StatsBar';
import Narrative from './Narrative';
import ChoiceList from './ChoiceList';
import type { GameState } from '@/app/types/game';
import { INITIAL_GAME_STATE } from '@/app/lib/initialState';

export default function GameShell() {
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (key: 'A' | 'B' | 'C' | 'D', customText?: string) => {
    setLoading(true);
    // TODO: call LLM API route, update game state
    // For now, mock a stat change to show the mechanics
    setGame((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        sanity: Math.max(0, prev.stats.sanity - 8),
        prestige: prev.stats.prestige + (key === 'D' ? 2 : 1),
        awakening: key === 'D' ? prev.stats.awakening + 15 : prev.stats.awakening,
        capital: prev.stats.capital + (key === 'A' ? 1200 : key === 'B' ? 500 : 200),
      },
      round: Math.min(10, prev.round + 1),
    }));
    setLoading(false);
  };

  const { stats, round, currentRound } = game;
  const totalRounds = 10;

  return (
    <div className="card">
      {/* Title */}
      <h1 className="game-title">硅谷：第一天与最后一天</h1>
      <p className="game-subtitle">DAY 1 &amp; LAST DAY · TERMINAL BUILD v0.1</p>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Round indicator */}
      <p className="round-label">
        ROUND{' '}
        <span className="round-current">
          {String(round).padStart(2, '0')}
        </span>{' '}
        / {totalRounds}
        {currentRound && (
          <span className="round-title"> — {currentRound.title}</span>
        )}
      </p>

      {/* Narrative */}
      {currentRound && <Narrative text={currentRound.narrative} />}

      <hr className="divider" />

      {/* Choices */}
      {currentRound && (
        <ChoiceList
          choices={currentRound.choices}
          onSelect={handleChoice}
          disabled={loading}
        />
      )}

      {loading && <p className="loading-text">processing…</p>}
    </div>
  );
}
