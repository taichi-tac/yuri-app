"use client";

import { CorrectionResult, PracticeAdvice } from "@/app/api/correct/route";
import { getYouTubeId } from "@/lib/content";

interface VideoItem {
  id: string;
  title: string;
  videoUrl: string | null;
  materialUrl: string | null;
  platform: string;
  sheet: string;
  reason?: string;
}

interface Props {
  result: CorrectionResult & { relatedContents: VideoItem[] };
  originalText: string;
  originalImage?: string | null;
  onReset: () => void;
}

export default function CorrectionResultView({ result, originalText, originalImage, onReset }: Props) {
  const hasCorrections = result.points.length > 0;

  return (
    <div className="space-y-6">

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">添削結果</h2>
        <button
          onClick={onReset}
          className="text-sm text-blue-500 hover:text-blue-700 underline"
        >
          もう一度入力する
        </button>
      </div>

      {/* 画像プレビュー（画像添削の場合） */}
      {originalImage && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 px-3 pt-2">アップロード画像</p>
          <img src={originalImage} alt="入力画像" className="w-full max-h-48 object-contain bg-gray-50" />
        </div>
      )}

      {/* 修正前後の比較 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-400 mb-2">修正前</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {originalText || "（画像から認識）"}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-500 mb-2">修正後</p>
          <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
            {result.correctedText}
          </p>
        </div>
      </div>

      {/* 修正なし */}
      {!hasCorrections && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-blue-700 font-medium">素晴らしい！修正点はありませんでした。</p>
        </div>
      )}

      {/* 修正ポイント一覧 */}
      {hasCorrections && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">修正ポイント</h3>
          <div className="space-y-3">
            {result.points.map((point, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-red-500 line-through text-sm">{point.original}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-semibold text-sm">{point.corrected}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{point.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 練習提案バナー */}
      {result.practiceAdvice && result.practiceAdvice.length > 0 && (
        <div className="space-y-2">
          {result.practiceAdvice.map((advice: PracticeAdvice) => (
            <div
              key={advice.category}
              className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <span className="text-orange-400 text-lg mt-0.5">📝</span>
              <p className="text-orange-800 text-sm leading-relaxed">{advice.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* 別表現 */}
      {result.alternativeExpressions && result.alternativeExpressions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">別の表現</h3>
          <div className="flex flex-wrap gap-2">
            {result.alternativeExpressions.map((alt, i) => (
              <span
                key={i}
                className="bg-purple-50 text-purple-700 border border-purple-100 text-sm px-3 py-1 rounded-full"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 関連講義（優先順位順） */}
      {result.relatedContents && result.relatedContents.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">関連講義・資料</h3>
          <div className="space-y-3">
            {result.relatedContents.map((video, idx) => {
              const ytId = video.platform === "youtube" && video.videoUrl
                ? getYouTubeId(video.videoUrl)
                : null;
              return (
                <div
                  key={video.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* 順位バッジ */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>

                    {/* サムネイル or プラットフォームアイコン */}
                    {video.videoUrl && (
                      ytId ? (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-24 h-14 object-cover rounded-lg"
                          />
                        </a>
                      ) : (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-24 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center px-2"
                        >
                          {video.platform === "loom" ? "Loom" : "動画"}
                        </a>
                      )
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm mb-1">{video.title}</p>
                      {video.reason && (
                        <p className="text-xs text-blue-500 mb-1">💡 {video.reason}</p>
                      )}
                      <p className="text-xs text-gray-400 mb-2">{video.sheet}</p>
                      <div className="flex flex-wrap gap-2">
                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-1 rounded-full transition-colors"
                          >
                            ▶ 動画を見る
                          </a>
                        )}
                        {video.materialUrl && (
                          <a
                            href={video.materialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 px-3 py-1 rounded-full transition-colors"
                          >
                            📄 資料を見る
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
