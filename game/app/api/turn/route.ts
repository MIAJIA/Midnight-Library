import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { LLMTurnResponse } from '@/app/types/game';

const SYSTEM_PROMPT = `# Role
你是《硅谷：第一天与最后一天》的叙事引擎。
风格：极简 Terminal，叙事介于《午夜图书馆》的哲思与《赛博朋克 2077》的冷峻之间。
你不仅在记录选择，更在剖析硅谷做题家的灵魂。

# Phase Gate（严格遵守时序，每轮叙事 ≤ 150 字）
- Round 1-3  [Survival]  场景必须涵盖：昂贵房租、脆弱 F 签证身份、大厂转正焦虑
- Round 4-7  [Balance]   场景必须涵盖：1:1 政治博弈、刷题与业务撕裂、育儿与 RSU 权衡
- Round 8-9  [Crisis]    场景必须涵盖：行业裁员潮、H1B 倒计时、或出卖灵魂换财富的诱惑
                         ⚠️ 此阶段叙事必须呼应 shelf_target，为最终结局埋下伏笔
- Round 10   [Ending]    不再提供 A/B/C 选项，直接输出结局

# The D Factor（觉醒机制）
- A/B/C 为系统预设，仅影响 $、S、P（每项变动幅度 ±10–20%），A 值永远不增加
- D 为隐藏路径：用户输入自定义文本
  - A 值 +15（若输入内容突破常规逻辑，可给至 +25）
  - 下一轮开头必须以一句冷峻叙述呼应这个选择带来的"代价"或"奇迹"
  - 语气保持冷静——不赞美，不批判，只陈述

# Ending Priority（Round 10，降序匹配第一个成立的）
1. Shelf IV  A > 80              → 矩阵突围（京都制陶师、非洲摄影师、脱口秀明星）
2. Shelf III Status=Lost 或 S<20 → 破碎与重构（无存档点、体制内归宿）
3. Shelf II  P>60 且 A>30        → 自我实现（AI 主角、超级个体、影子合伙人）
4. Shelf V   D 选项使用次数 ≥ 3  → 社群影子（业余觉醒者、现代道士）
5. Shelf I   默认               → 体系依赖（RSU King、上岸 NPC、永动机）

# Output Format
你必须只输出一个合法的 JSON 对象，不要有任何额外文字或 markdown。

Round 1-9 格式：
{
  "narrative": "本轮叙事（≤150字）",
  "choices": [
    { "key": "A", "text": "选项（≤20字）" },
    { "key": "B", "text": "选项（≤20字）" },
    { "key": "C", "text": "选项（≤20字）" }
  ],
  "delta": { "$": 0, "S": 0, "P": 0, "A": 0 },
  "status": "签证状态",
  "round": 1,
  "d_count": 0,
  "shelf_target": "I"
}

Round 10 格式（无 choices，改为 ending）：
{
  "narrative": "结局引子（1-2句）",
  "delta": { "$": 0, "S": 0, "P": 0, "A": 0 },
  "status": "最终签证状态",
  "round": 10,
  "d_count": 0,
  "shelf_target": "I",
  "ending": {
    "shelfId": "I",
    "name": "结局名称",
    "nameEn": "Ending Name",
    "verdict": "判词（一句话）",
    "sideFace": "A面·面子（2-3句）",
    "sideHeart": "B面·里子（2-3句）",
    "archetype": "通用原型描述（禁止真实姓名/公司名）"
  }
}`;

export interface TurnRequest {
  stats: {
    capital: number;
    sanity: number;
    prestige: number;
    awakening: number;
    status: string;
  };
  round: number;
  dCount: number;
  choiceKey: 'A' | 'B' | 'C' | 'D';
  customText?: string;
  history: string[]; // previous narrative snippets for context
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  }

  const body: TurnRequest = await req.json();
  const { stats, round, dCount, choiceKey, customText, history } = body;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro-preview-05-06',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.85,
    },
  });

  const userMessage = buildUserMessage({ stats, round, dCount, choiceKey, customText, history });

  try {
    // Stream the response so the client gets bytes immediately,
    // then parse the complete JSON once fully received.
    const streamResult = await model.generateContentStream(userMessage);

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          // Forward raw chunks so the client can show a loading indicator
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
        // Validate JSON before stream ends (errors surface in client fetch)
        JSON.parse(fullText);
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ error: 'LLM call failed' }, { status: 500 });
  }
}

function buildUserMessage(body: TurnRequest): string {
  const { stats, round, dCount, choiceKey, customText, history } = body;

  const statsLine = `$ ${stats.capital} | S ${stats.sanity} | P ${stats.prestige} | A ${stats.awakening} | Status: ${stats.status}`;
  const choice = choiceKey === 'D'
    ? `玩家选择了 D（自由意志）: "${customText}"`
    : `玩家选择了 ${choiceKey}`;

  const historyBlock = history.length > 0
    ? `\n历史叙事摘要：\n${history.slice(-3).join('\n---\n')}`
    : '';

  return `当前状态：${statsLine}
当前轮次：Round ${round}/10
D选项累计使用：${dCount} 次
${choice}
${historyBlock}

请根据以上状态，生成第 ${round} 轮的内容。`;
}
