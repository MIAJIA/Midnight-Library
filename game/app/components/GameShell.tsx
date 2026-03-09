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
    // TODO: replace mock with POST /api/turn
    const isD = key === 'D';
    setGame((prev) => {
      const nextDCount = isD ? prev.dCount + 1 : prev.dCount;
      const nextRound = Math.min(10, prev.round + 1);
      // Mock shelf_target heuristic (LLM will override this)
      const nextShelf = prev.stats.awakening + (isD ? 15 : 0) > 80 ? 'IV'
        : prev.stats.prestige > 60 && prev.stats.awakening > 30 ? 'II'
        : nextDCount >= 3 ? 'V'
        : 'I';
      return {
        ...prev,
        dCount: nextDCount,
        shelfTarget: nextShelf as typeof prev.shelfTarget,
        round: nextRound,
        phase: nextRound === 10 ? 'ending' : 'playing',
        stats: {
          ...prev.stats,
          sanity:    Math.max(0, prev.stats.sanity - 8),
          prestige:  prev.stats.prestige + (isD ? 2 : 1),
          awakening: isD ? Math.min(100, prev.stats.awakening + 15) : prev.stats.awakening,
          capital:   prev.stats.capital + (key === 'A' ? 1200 : key === 'B' ? 500 : 200),
        },
      };
    });
    setLoading(false);
  };

  const { stats, round, dCount, shelfTarget, currentRound, phase, endingContent } = game;
  const isEnding = phase === 'ending';

  return (
    <div className="card">
      <h1 className="game-title">硅谷：第一天与最后一天</h1>
      <p className="game-subtitle">DAY 1 &amp; LAST DAY · TERMINAL BUILD v0.1</p>

      <StatsBar stats={stats} />

      <p className="round-label">
        ROUND{' '}
        <span className="round-current">{String(round).padStart(2, '0')}</span>
        {' '}/ 10
        {currentRound && !isEnding && (
          <span className="round-title"> — {currentRound.title}</span>
        )}
      </p>

      {/* ── Playing phase ── */}
      {!isEnding && currentRound && (
        <>
          <Narrative text={currentRound.narrative} />
          <hr className="divider" />
          <ChoiceList
            choices={currentRound.choices}
            onSelect={handleChoice}
            disabled={loading}
          />
        </>
      )}

      {/* ── Ending phase ── */}
      {isEnding && (
        <div className="ending-panel">
          <p className="ending-seal">⬛⬛⬛ 命运尘埃落定 ⬛⬛⬛</p>
          <hr className="divider" />
          {endingContent ? (
            <>
              <p className="ending-label">【成就解锁】<span className="ending-name">{endingContent.name} · {endingContent.nameEn}</span></p>
              <p className="ending-verdict">【判　　词】{endingContent.verdict}</p>
              <p className="ending-section"><span className="ending-label">【A面·面子】</span>{endingContent.sideFace}</p>
              <p className="ending-section"><span className="ending-label">【B面·里子】</span>{endingContent.sideHeart}</p>
              <p className="ending-section"><span className="ending-label">【原　　型】</span>{endingContent.archetype}</p>
            </>
          ) : (
            <p className="loading-text">computing your fate…</p>
          )}
          <hr className="divider" />
          <p className="ending-footer">&gt; 你的结局已被记录。分享你的判词，或重新开始。</p>
        </div>
      )}

      {loading && <p className="loading-text">processing…</p>}
    </div>
  );
}
