import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam, Base64ImageSource } from "@anthropic-ai/sdk/resources/messages";
import { GrammarCategory } from "@/lib/content";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export type Level = "beginner" | "intermediate";

const CATEGORY_LABELS: Record<string, string> = {
  tense: "時制",
  perfect: "完了形",
  modal: "助動詞",
  infinitive: "不定詞",
  gerund: "動名詞",
  comparison: "比較",
  participle: "分詞",
  relative_pronoun: "関係代名詞",
  relative_adverb: "関係副詞",
  preposition: "前置詞",
  conjunction: "接続詞",
};

export interface CorrectionPoint {
  original: string;
  corrected: string;
  explanation: string;
  categories: GrammarCategory[];
}

export interface PracticeAdvice {
  category: GrammarCategory;
  label: string;
  message: string;
  count: number;
}

export interface CorrectionResult {
  correctedText: string;
  points: CorrectionPoint[];
  relatedContentIds: GrammarCategory[];
  alternativeExpressions: string[];
  practiceAdvice: PracticeAdvice[];
}

function buildSystemPrompt(level: Level): string {
  const levelInstruction =
    level === "beginner"
      ? `【レベル: 初心者】
文法の明らかなミス（動詞の形、時制の誤り、語順など）の修正のみを行ってください。
表現の自然さや言い換えは指摘しません。シンプルに正しい英文を伝えることに集中してください。`
      : `【レベル: 中級者】
文法ミスの修正に加えて、より自然な英語表現への言い換えも提案してください。
ネイティブが使う自然な言い回し、語彙のアップグレード、文体の改善なども積極的に提示してください。`;

  return `あなたは英語学習者の英作文を添削する専門家です。
日本人英語学習者の視点に立ち、分かりやすく丁寧に添削してください。

${levelInstruction}

以下のJSON形式のみで回答してください（前後に余計なテキスト不要）:
{
  "correctedText": "添削後の英文",
  "points": [
    {
      "original": "修正前の表現",
      "corrected": "修正後の表現",
      "explanation": "修正理由の日本語解説",
      "categories": ["該当する文法カテゴリのID（複数可）"]
    }
  ],
  "relatedContentIds": ["関連する文法カテゴリのIDリスト（優先度高い順に最大3個）"],
  "alternativeExpressions": ["別表現1", "別表現2"]
}

文法カテゴリIDの選択肢:
- tense（時制）
- perfect（完了形）
- modal（助動詞）
- infinitive（不定詞）
- gerund（動名詞）
- comparison（比較）
- participle（分詞）
- relative_pronoun（関係代名詞）
- relative_adverb（関係副詞）
- preposition（前置詞）

relatedContentIds は修正点に直結するカテゴリを優先度の高い順に最大3個選んでください。
修正点がない場合は points を空配列、alternativeExpressions を空配列にしてください。`;
}

function buildPracticeAdvice(points: CorrectionPoint[]): PracticeAdvice[] {
  if (points.length === 0) return [];

  // カテゴリ別にカウント
  const counts: Partial<Record<GrammarCategory, number>> = {};
  for (const point of points) {
    for (const cat of point.categories) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }

  // 2件以上ミスがあるカテゴリだけ提案
  const advice: PracticeAdvice[] = [];
  for (const [cat, count] of Object.entries(counts) as [GrammarCategory, number][]) {
    if (count < 2) continue;
    const label = CATEGORY_LABELS[cat] ?? cat;
    advice.push({
      category: cat,
      label,
      count,
      message: `${label}のミスが${count}箇所ありました。特訓問題集で${label}をもう5問やってみましょう！`,
    });
  }

  // 多い順にソート
  return advice.sort((a, b) => b.count - a.count);
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  let inputText = "";
  let level: Level = "beginner";
  let imageBase64: string | null = null;
  let imageMediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    inputText = (formData.get("text") as string | null) ?? "";
    level = ((formData.get("level") as string | null) ?? "beginner") as Level;
    const file = formData.get("image") as File | null;
    if (file) {
      const buffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
      type ValidMime = typeof validTypes[number];
      const mime = file.type;
      imageMediaType = validTypes.includes(mime as ValidMime)
        ? (mime as ValidMime)
        : "image/jpeg";
    }
  } else {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid request" }, { status: 400 });
    inputText = (body.text as string | null) ?? "";
    level = (body.level as Level | null) ?? "beginner";
  }

  const hasImage = imageBase64 && imageMediaType;
  const hasText = inputText.trim().length > 0;

  if (!hasImage && !hasText) {
    return NextResponse.json({ error: "text or image is required" }, { status: 400 });
  }

  // DBからAPIキーを取得（管理画面での保存が即反映される）
  const apiKey = await getSetting("ANTHROPIC_API_KEY") ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。管理画面（/admin）でAnthropicのAPIキーを設定してください。" },
      { status: 503 }
    );
  }
  const client = new Anthropic({ apiKey });

  const systemPrompt = buildSystemPrompt(level);

  // メッセージ内容を構築
  const userContent: ContentBlockParam[] = [];

  if (hasImage) {
    const imageSource: Base64ImageSource = {
      type: "base64",
      media_type: imageMediaType!,
      data: imageBase64!,
    };
    userContent.push({ type: "image", source: imageSource });
    userContent.push({
      type: "text",
      text: hasText
        ? `画像内の英文と以下のテキストを添削してください:\n${inputText.trim().slice(0, 2000)}`
        : "この画像内の英文を添削してください。",
    });
  } else {
    userContent.push({ type: "text", text: inputText.trim().slice(0, 2000) });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: CorrectionResult;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "parse error", raw }, { status: 500 });
  }

  // practiceAdviceを生成
  const practiceAdvice = buildPracticeAdvice(parsed.points ?? []);

  // DBから関連動画を取得
  // 1. 添削で検出した文法カテゴリのYouTube動画（priority=1）を最優先
  // 2. 同カテゴリの補足動画（Loom等）
  // 3. 修正点のキーワードに一致する動画
  const relatedCategories = parsed.relatedContentIds ?? [];

  const allVideos = await prisma.video.findMany({
    where: { videoUrl: { not: null } },
    orderBy: [{ priority: "asc" }, { platform: "asc" }],
  });

  // カテゴリ一致の動画を収集（YouTube優先）+ 理由ラベル付き
  type VideoWithReason = typeof allVideos[number] & { reason: string };

  const categoryMatches: VideoWithReason[] = allVideos
    .filter((v) => v.grammarCategory && relatedCategories.includes(v.grammarCategory as GrammarCategory))
    .map((v) => ({
      ...v,
      reason: `${CATEGORY_LABELS[v.grammarCategory!] ?? v.grammarCategory}の修正があったため`,
    }));

  // キーワード一致: タイトルのキーワードが修正前・修正後の表現と一致するもののみ
  const categoryMatchIds = new Set(categoryMatches.map((v) => v.id));
  const correctionExpressions = (parsed.points ?? [])
    .flatMap((p) => [p.original.toLowerCase(), p.corrected.toLowerCase()])
    .filter(Boolean);

  const keywordMatches: VideoWithReason[] = allVideos
    .filter((v) => {
      if (categoryMatchIds.has(v.id)) return false;
      const kws: string[] = JSON.parse(v.keywords ?? "[]");
      return kws.some((kw) =>
        correctionExpressions.some((expr) => expr.includes(kw.toLowerCase()) || kw.toLowerCase().includes(expr))
      );
    })
    .map((v) => ({ ...v, reason: `「${v.title}」に関連する表現の修正があったため` }));

  // 合計最大5件、YouTube優先で並べる
  const relatedContents = [...categoryMatches, ...keywordMatches]
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const aYt = a.platform === "youtube" ? 0 : 1;
      const bYt = b.platform === "youtube" ? 0 : 1;
      return aYt - bYt;
    })
    .slice(0, 5);

  // ログイン済みユーザーの履歴を保存（未ログインは保存しない）
  const session = await auth();
  if (session?.user?.id) {
    await prisma.correctionHistory.create({
      data: {
        userId: session.user.id,
        originalText: inputText.trim().slice(0, 2000),
        correctedText: parsed.correctedText ?? "",
        level,
        pointsJson: JSON.stringify(parsed.points ?? []),
        relatedContentIdsJson: JSON.stringify(parsed.relatedContentIds ?? []),
        alternativeExpressionsJson: JSON.stringify(parsed.alternativeExpressions ?? []),
        practiceAdviceJson: JSON.stringify(practiceAdvice),
        hasImage: !!hasImage,
      },
    }).catch(() => null); // 保存失敗しても添削結果は返す
  }

  return NextResponse.json({ ...parsed, practiceAdvice, relatedContents });
}
