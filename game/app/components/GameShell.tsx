'use client';

import { useState } from 'react';
import StatsBar from './StatsBar';
import Narrative from './Narrative';
import ChoiceList from './ChoiceList';
import type { GameState, LLMTurnResponse } from '@/app/types/game';
import { INITIAL_GAME_STATE } from '@/app/lib/initialState';

export default function GameShell() {
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChoice = async (key: 'A' | 'B' | 'C' | 'D', customText?: string) => {
    setLoading(true);
    setTypedText('');
    setError(null);

    try {
      const res = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: game.stats,
          round: game.round,
          dCount: game.dCount,
          choiceKey: key,
          customText,
          history,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      if (!res.body) throw new Error('No response body');

      // Read the stream and accumulate full JSON
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        // Show partial narrative as it arrives (extract from partial JSON)
        const narrativeMatch = fullText.match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (narrativeMatch) setTypedText(narrativeMatch[1].replace(/\\n/g, '\n'));
      }

      const data: LLMTurnResponse = JSON.parse(fullText);
      setTypedText(null);
      setHistory((h) => [...h, data.narrative]);
      setGame((prev) => ({
        ...prev,
        round: data.round,
        dCount: data.d_count,
        shelfTarget: data.shelf_target,
        phase: data.ending ? 'ending' : 'playing',
        endingContent: data.ending,
        currentRound: data.choices
          ? { ...prev.currentRound!, narrative: data.narrative, choices: data.choices }
          : prev.currentRound,
        stats: {
          capital:   Math.max(0, prev.stats.capital   + data.delta.$),
          sanity:    Math.max(0, Math.min(100, prev.stats.sanity   + data.delta.S)),
          prestige:  Math.max(0, Math.min(100, prev.stats.prestige + data.delta.P)),
          awakening: Math.max(0, Math.min(100, prev.stats.awakening + data.delta.A)),
          status: data.status,
        },
      }));
    } catch (e) {
      setTypedText(null);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
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
      {!isEnding && (
        <>
          <Narrative text={typedText !== null ? typedText : (currentRound?.narrative ?? '')} />
          <hr className="divider" />
          {!loading && currentRound && (
            <ChoiceList
              choices={currentRound.choices}
              onSelect={handleChoice}
              disabled={false}
            />
          )}
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
      {error && <p className="error-text">! {error}</p>}
    </div>
  );
}
