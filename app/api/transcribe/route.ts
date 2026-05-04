import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import OpenAI from "openai";
import fs from "fs";
import { createWriteStream } from "fs";
import path from "path";
import os from "os";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // DBからAPIキーを取得（管理画面での保存が即反映される）
  const apiKey = await getSetting("OPENAI_API_KEY") ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_openai_key" }, { status: 422 });
  }

  const formData = await req.formData();
  const file = formData.get("audio") as File | null;
  if (!file) {
    return NextResponse.json({ error: "audio file required" }, { status: 400 });
  }

  // Check file size (max 25MB - Whisper API limit)
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "file too large" }, { status: 413 });
  }

  const ext = file.name.endsWith(".ogg") ? "ogg" : "webm";
  const tmpPath = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);

  try {
    // Stream the file to disk instead of loading into memory
    const webStream = file.stream();
    const nodeStream = Readable.fromWeb(webStream as import("stream/web").ReadableStream);
    await pipeline(nodeStream, createWriteStream(tmpPath));

    const openai = new OpenAI({ apiKey });
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: "whisper-1",
      language: "en",
    });
    return NextResponse.json({ text: transcription.text });
  } finally {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}
