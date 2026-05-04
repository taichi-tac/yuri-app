"use client";

import { useRef, useState } from "react";
import { Level } from "@/app/api/correct/route";
import VoiceInput from "@/components/VoiceInput";

interface Props {
  onSubmit: (text: string, level: Level, image?: File) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    onSubmit(text.trim(), level, image ?? undefined);
  };

  const handleImageChange = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageChange(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const examples = [
    "I have went to Tokyo yesterday.",
    "She don't know the answer.",
    "I am interesting in English.",
  ];

  const canSubmit = (text.trim().length > 0 || image !== null) && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* レベル選択 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">添削レベルを選択</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLevel("beginner")}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              level === "beginner"
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className={`font-semibold text-sm ${level === "beginner" ? "text-blue-700" : "text-gray-700"}`}>
              初心者
            </p>
            <p className="text-xs text-gray-500 mt-0.5">文法ミスの修正のみ</p>
          </button>
          <button
            type="button"
            onClick={() => setLevel("intermediate")}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              level === "intermediate"
                ? "border-purple-400 bg-purple-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className={`font-semibold text-sm ${level === "intermediate" ? "text-purple-700" : "text-gray-700"}`}>
              中級者
            </p>
            <p className="text-xs text-gray-500 mt-0.5">自然な表現への言い換えも</p>
          </button>
        </div>
      </div>

      {/* テキスト入力 */}
      <div>
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-1">
          英文を入力
        </label>
        <textarea
          id="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="例: I have went to Tokyo yesterday."
          className="w-full rounded-xl border border-gray-200 p-4 text-base shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-400">{text.length} / 2000文字</p>
      </div>

      {/* 音声入力 */}
      <VoiceInput
        onTranscribed={(t) => setText((prev) => prev ? prev + " " + t : t)}
        disabled={loading}
      />

      {/* 例文ボタン */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-400 self-center">例文:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors"
            disabled={loading}
          >
            {ex.length > 30 ? ex.slice(0, 30) + "…" : ex}
          </button>
        ))}
      </div>

      {/* 画像アップロード */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          画像アップロード（ノート写真など）
        </p>
        {imagePreview ? (
          <div className="relative rounded-xl border border-gray-200 overflow-hidden">
            <img src={imagePreview} alt="プレビュー" className="w-full max-h-64 object-contain bg-gray-50" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 rounded-full w-7 h-7 flex items-center justify-center shadow text-sm font-bold"
            >
              ✕
            </button>
            {image?.name.endsWith(".jpg") === false && (
              <div className="bg-yellow-50 border-t border-yellow-100 px-3 py-2 text-xs text-yellow-700">
                ⚠️ 手書き文字は誤認識が生じる場合があります。文字起こし結果をご確認ください。
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <p className="text-gray-400 text-sm">クリックまたはドラッグ＆ドロップ</p>
            <p className="text-gray-300 text-xs mt-1">JPG / PNG / WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageChange(file);
              }}
              disabled={loading}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
      >
        {loading ? "添削中…" : "添削する"}
      </button>
    </form>
  );
}
