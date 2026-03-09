import type { GameState, Round } from '@/app/types/game';

export const INITIAL_STATS = {
  capital: 5000,
  sanity: 100,
  prestige: 10,
  awakening: 0,
  status: 'F-1 Visa (Pending H1B)' as const,
};

// Demo round shown in UI before LLM is wired up
export const DEMO_ROUND: Round = {
  number: 4,
  phase: 'balance',
  title: 'H1B 抽签日',
  narrative:
    '2024年4月1日。你盯着屏幕上的邮件主题行。\n\nUSCIS Case Status Update\n\n你的手指悬在触控板上，迟迟没有点击。旁边工位的 Kevin 已经开始低声欢呼了。\n\n你不知道那封邮件里装的，是你接下来三年的居留权，还是一张 72 小时内离境的通知书。',
  choices: [
    { key: 'A', text: '深呼吸，点开邮件。' },
    { key: 'B', text: '先去洗手间冷静一下。' },
    { key: 'C', text: '假装没看到，继续写代码。' },
  ],
};

export const INITIAL_GAME_STATE: GameState = {
  stats: INITIAL_STATS,
  round: 4,
  currentRound: DEMO_ROUND,
  phase: 'playing',
};
