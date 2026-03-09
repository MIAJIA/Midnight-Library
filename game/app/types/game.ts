export type VisaStatus =
  | 'F-1 Visa (Pending H1B)'
  | 'H-1B (Lottery Pending)'
  | 'H-1B (Approved)'
  | 'Green Card (Pending)'
  | 'Green Card (Approved)'
  | 'Status: Lost';

export type GamePhase = 'boot' | 'playing' | 'ending';

export interface Stats {
  capital: number;   // $ —归零即遣返
  sanity: number;    // S — 0–100
  prestige: number;  // P — 0–100
  awakening: number; // A — hidden, 0–100
  status: VisaStatus;
}

export interface StatDelta {
  $: number;
  S: number;
  P: number;
  A: number;
}

export interface Choice {
  key: 'A' | 'B' | 'C';
  text: string;
}

export interface Round {
  number: number;
  phase: 'survival' | 'balance' | 'crisis' | 'ending';
  title: string;
  narrative: string;
  choices: Choice[];
}

export interface GameState {
  stats: Stats;
  round: number;
  currentRound: Round | null;
  phase: GamePhase;
  endingId?: string;
  endingContent?: EndingContent;
}

export interface EndingContent {
  id: string;
  name: string;
  nameEn: string;
  verdict: string;
  sideFace: string;   // A面
  sideHeart: string;  // B面
  archetype: string;
}
