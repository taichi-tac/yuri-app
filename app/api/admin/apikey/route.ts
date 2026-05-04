import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/settings";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "yuri-admin";

function maskKey(key: string): string {
  return key.slice(0, 10) + "••••••••••••••••••••";
}

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET: 各APIキーの設定状態を返す（キー本体は返さない）
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [anthropicKey, openaiKey] = await Promise.all([
    getSetting("ANTHROPIC_API_KEY"),
    getSetting("OPENAI_API_KEY"),
  ]);

  return NextResponse.json({
    anthropic: {
      isSet: !!anthropicKey && anthropicKey.length > 10,
      masked: anthropicKey && anthropicKey.length > 10 ? maskKey(anthropicKey) : null,
    },
    openai: {
      isSet: !!openaiKey && openaiKey.length > 10,
      masked: openaiKey && openaiKey.length > 10 ? maskKey(openaiKey) : null,
    },
  });
}

// POST: APIキーをDBに保存
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (typeof body.anthropicApiKey === "string" && body.anthropicApiKey.trim()) {
    const key = body.anthropicApiKey.trim();
    if (!key.startsWith("sk-")) {
      return NextResponse.json(
        { error: "AnthropicのAPIキーは sk- から始まる必要があります" },
        { status: 400 }
      );
    }
    await setSetting("ANTHROPIC_API_KEY", key);
  }

  if (typeof body.openaiApiKey === "string" && body.openaiApiKey.trim()) {
    const key = body.openaiApiKey.trim();
    if (!key.startsWith("sk-")) {
      return NextResponse.json(
        { error: "OpenAIのAPIキーは sk- から始まる必要があります" },
        { status: 400 }
      );
    }
    await setSetting("OPENAI_API_KEY", key);
  }

  return NextResponse.json({ ok: true });
}
