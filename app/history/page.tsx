"use client";

import { useEffect, useState } from "react";
import { CorrectionPoint, PracticeAdvice } from "@/app/api/correct/route";
import { GRAMMAR_CONTENTS, GrammarCategory, getYouTubeId } from "@/lib/content";

interface HistoryItem {
  id: string;
  originalText: string;
  correctedText: string;
  level: string;
  points: CorrectionPoint[];
  relatedContentIds: GrammarCategory[];
  alternativeExpressions: string[];
  practiceAdvice: PracticeAdvice[];
  hasImage: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">Y</div>
            <h1 className="text-base font-bold text-gray-800">添削履歴</h1>
          </div>
          <a href="/" className="text-sm text-blue-500 hover:underline">← 添削する</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            まだ添削履歴がありません。<br />
            <a href="/" className="text-blue-500 underline mt-2 inline-block">英文を添削してみましょう</a>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {item.hasImage ? "📷 " : ""}{item.originalText || "（画像添削）"}
                    </p>
                    <p className="text-xs text-green-600 truncate mt-0.5">{item.correctedText}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.level === "beginner"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}>
                      {item.level === "beginner" ? "初心者" : "中級者"}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                  </div>
                </div>

                {/* 修正点バッジ */}
                {item.points.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">{item.points.length}件の修正</p>
                )}

                {/* 展開: 詳細 */}
                {selected?.id === item.id && (
                  <div className="mt-4 space-y-4 text-left border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>

                    {/* 修正ポイント */}
                    {item.points.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">修正ポイント</p>
                        <div className="space-y-2">
                          {item.points.map((p, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-3">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-red-500 line-through text-xs">{p.original}</span>
                                <span className="text-gray-400 text-xs">→</span>
                                <span className="text-green-600 font-semibold text-xs">{p.corrected}</span>
                              </div>
                              <p className="text-xs text-gray-500">{p.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 練習提案 */}
                    {item.practiceAdvice.length > 0 && (
                      <div className="space-y-2">
                        {item.practiceAdvice.map((a) => (
                          <div key={a.category} className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-xs text-orange-800">
                            📝 {a.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 別表現 */}
                    {item.alternativeExpressions.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">別の表現</p>
                        <div className="flex flex-wrap gap-2">
                          {item.alternativeExpressions.map((alt, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 border border-purple-100 text-xs px-3 py-1 rounded-full">{alt}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 関連講義 */}
                    {item.relatedContentIds.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">関連講義</p>
                        <div className="flex flex-wrap gap-2">
                          {item.relatedContentIds.map((id) => {
                            const c = GRAMMAR_CONTENTS.find((x) => x.id === id);
                            if (!c) return null;
                            const ytId = c.video.platform === "youtube" ? getYouTubeId(c.video.url) : null;
                            return (
                              <a
                                key={id}
                                href={c.video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                              >
                                {ytId && (
                                  <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-8 h-5 object-cover rounded" alt="" />
                                )}
                                ▶ {c.label}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
