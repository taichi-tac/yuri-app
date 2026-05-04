"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import CorrectionResultView from "@/components/CorrectionResult";
import { CorrectionResult, Level } from "@/app/api/correct/route";

interface VideoItem {
  id: string;
  title: string;
  videoUrl: string | null;
  materialUrl: string | null;
  platform: string;
  sheet: string;
}

type ResultWithContents = CorrectionResult & { relatedContents: VideoItem[] };

export default function HomeClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultWithContents | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const handleSubmit = async (text: string, level: Level, image?: File) => {
    setLoading(true);
    setError(null);
    setOriginalText(text);

    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImage(e.target?.result as string);
      reader.readAsDataURL(image);
    } else {
      setOriginalImage(null);
    }

    try {
      let res: Response;
      if (image) {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("level", level);
        formData.append("image", image);
        res = await fetch("/api/correct", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/correct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, level }),
        });
      }
      if (!res.ok) throw new Error("添削に失敗しました。もう一度お試しください。");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setOriginalText("");
    setOriginalImage(null);
    setError(null);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {result ? (
          <CorrectionResultView
            result={result}
            originalText={originalText}
            originalImage={originalImage}
            onReset={handleReset}
          />
        ) : (
          <InputForm onSubmit={handleSubmit} loading={loading} />
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-xs mx-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-medium">添削中です…</p>
            <p className="text-gray-400 text-sm mt-1">少しお待ちください</p>
          </div>
        </div>
      )}
    </main>
  );
}
