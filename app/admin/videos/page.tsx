"use client";

import { useState, useEffect } from "react";

const GRAMMAR_CATEGORIES = [
  { id: "tense", label: "時制" },
  { id: "perfect", label: "完了形" },
  { id: "modal", label: "助動詞" },
  { id: "infinitive", label: "不定詞" },
  { id: "gerund", label: "動名詞" },
  { id: "comparison", label: "比較" },
  { id: "participle", label: "分詞" },
  { id: "relative_pronoun", label: "関係代名詞" },
  { id: "relative_adverb", label: "関係副詞" },
  { id: "preposition", label: "前置詞" },
  { id: "conjunction", label: "接続詞" },
];

const SHEETS = ["文法カテゴリ", "全体配信", "文法解説", "例文の解説", "もくもく勉強会資料", "学習法関連", "その他"];

interface Video {
  id: string;
  title: string;
  videoUrl: string | null;
  materialUrl: string | null;
  platform: string;
  sheet: string;
  grammarCategory: string | null;
  priority: number;
}

const emptyForm = {
  title: "",
  videoUrl: "",
  materialUrl: "",
  sheet: "文法解説",
  grammarCategory: "",
};

export default function VideosAdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSheet, setFilterSheet] = useState("すべて");
  const [filterCategory, setFilterCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const headers = { "x-admin-password": password };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/admin/videos", { headers });
    if (!res.ok) { setAuthError("パスワードが違います"); return; }
    const text = await res.text();
    const data = text ? JSON.parse(text) : [];
    setVideos(data);
    setAuthed(true);
  };

  const fetchVideos = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/videos", { headers });
    setVideos(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError("");
    const res = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setSaveError(d.error ?? "保存に失敗しました");
    } else {
      setForm(emptyForm);
      setShowForm(false);
      await fetchVideos();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchVideos();
  };

  const startEdit = (v: Video) => {
    setEditingId(v.id);
    setEditForm({
      title: v.title,
      videoUrl: v.videoUrl ?? "",
      materialUrl: v.materialUrl ?? "",
      sheet: v.sheet,
      grammarCategory: v.grammarCategory ?? "",
    });
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    const res = await fetch("/api/admin/videos", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      setEditingId(null);
      await fetchVideos();
    }
    setSaving(false);
  };

  const filtered = videos.filter((v) => {
    if (filterSheet !== "すべて" && v.sheet !== filterSheet) return false;
    if (filterCategory !== "すべて" && v.grammarCategory !== filterCategory) return false;
    if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="text-base font-bold text-gray-800 mb-6">動画管理 — ログイン</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full rounded-xl border border-gray-200 p-3 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" disabled={!password} className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← 管理トップ</a>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-bold text-gray-800">動画・教材管理</h1>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{videos.length}件</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            ＋ 動画を追加
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* 追加フォーム */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4">新しい動画を追加</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">タイトル <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="例: 助動詞の使い分け④"
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">シート（カテゴリ）</label>
                  <select
                    value={form.sheet}
                    onChange={(e) => setForm({ ...form, sheet: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  >
                    {SHEETS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">動画URL</label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://youtu.be/... または https://loom.com/..."
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">資料URL</label>
                  <input
                    type="url"
                    value={form.materialUrl}
                    onChange={(e) => setForm({ ...form, materialUrl: e.target.value })}
                    placeholder="https://canva.link/..."
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">文法カテゴリ（添削結果に紐付ける場合）</label>
                  <select
                    value={form.grammarCategory}
                    onChange={(e) => setForm({ ...form, grammarCategory: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">なし（キーワード自動マッチング）</option>
                    {GRAMMAR_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  キャンセル
                </button>
                <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white text-sm font-semibold px-5 py-2 rounded-xl">
                  {saving ? "保存中…" : "追加する"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトルで検索..."
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none flex-1 min-w-40"
          />
          <select
            value={filterSheet}
            onChange={(e) => setFilterSheet(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="すべて">すべてのシート</option>
            {SHEETS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="すべて">すべての文法</option>
            {GRAMMAR_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400">{filtered.length}件</span>
        </div>

        {/* 動画一覧 */}
        <div className="space-y-2">
          {loading && <p className="text-center text-gray-400 py-8">読み込み中...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">動画が見つかりません</p>
          )}
          {filtered.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {editingId === v.id ? (
                // 編集フォーム
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">タイトル</label>
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">シート</label>
                      <select value={editForm.sheet} onChange={(e) => setEditForm({ ...editForm, sheet: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none">
                        {SHEETS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">動画URL</label>
                      <input type="url" value={editForm.videoUrl} onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">資料URL</label>
                      <input type="url" value={editForm.materialUrl} onChange={(e) => setEditForm({ ...editForm, materialUrl: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">文法カテゴリ</label>
                      <select value={editForm.grammarCategory} onChange={(e) => setEditForm({ ...editForm, grammarCategory: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none">
                        <option value="">なし</option>
                        {GRAMMAR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">キャンセル</button>
                    <button onClick={() => handleUpdate(v.id)} disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl">
                      {saving ? "保存中…" : "更新"}
                    </button>
                  </div>
                </div>
              ) : (
                // 通常表示
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {v.priority === 1 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">★ 最優先</span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{v.sheet}</span>
                      {v.grammarCategory && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {GRAMMAR_CATEGORIES.find((c) => c.id === v.grammarCategory)?.label ?? v.grammarCategory}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        v.platform === "youtube" ? "bg-red-100 text-red-600" :
                        v.platform === "loom" ? "bg-purple-100 text-purple-600" :
                        v.platform === "zoom" ? "bg-blue-100 text-blue-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>{v.platform}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{v.title}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {v.videoUrl && (
                        <a href={v.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline truncate max-w-xs">▶ 動画</a>
                      )}
                      {v.materialUrl && (
                        <a href={v.materialUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline truncate max-w-xs">📄 資料</a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(v)}
                      className="text-xs text-gray-400 hover:text-blue-500 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      編集
                    </button>
                    <button onClick={() => handleDelete(v.id, v.title)}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
