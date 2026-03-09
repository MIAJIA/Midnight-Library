export type VisaStatus =
  | 'F-1 Visa (Pending H1B)'
  | 'H-1B (Lottery Pending)'
  | 'H-1B (Approved)'
  | 'Green Card (Pending)'
  | 'Green Card (Approved)'
  | 'Status: Lost';

export type GamePhase = 'boot' | 'playing' | 'ending';

export type ShelfTarget = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface Stats {
  capital: number;   // $ — 归零即遣返
  sanity: number;    // S — 0–100
  prestige: number;  // P — 0–100
  awakening: number; // A — hidden from player, 0–100
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

// LLM JSON output — hidden from player, parsed by the API route
export interface LLMTurnResponse {
  delta: StatDelta;
  status: VisaStatus;
  round: number;
  d_count: number;        // cumulative D-option uses
  shelf_target: ShelfTarget; // LLM's current prediction of player's shelf
  narrative: string;
  choices?: Choice[];     // absent on round 10
  ending?: EndingContent; // present only on round 10
}

export interface GameState {
  stats: Stats;
  round: number;
  dCount: number;           // D uses so far
  shelfTarget: ShelfTarget; // latest LLM prediction (not shown to player)
  currentRound: Round | null;
  phase: GamePhase;
  endingContent?: EndingContent;
}

export interface EndingContent {
  shelfId: ShelfTarget;
  name: string;
  nameEn: string;
  verdict: string;
  sideFace: string;    // A面·面子
  sideHeart: string;   // B面·里子
  archetype: string;
}
