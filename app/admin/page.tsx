"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface KeyStatus {
  isSet: boolean;
  masked: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicStatus, setAnthropicStatus] = useState<KeyStatus>({ isSet: false, masked: null });
  const [openaiStatus, setOpenaiStatus] = useState<KeyStatus>({ isSet: false, masked: null });

  const [saveStatus, setSaveStatus] = useState<Status>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<Status>("idle");
  const [pwdMessage, setPwdMessage] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/admin/apikey", {
      headers: { "x-admin-password": password },
    });
    if (res.status === 401) {
      setAuthError("パスワードが違います");
      return;
    }
    const data = await res.json();
    setAnthropicStatus(data.anthropic);
    setOpenaiStatus(data.openai);
    setAuthed(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anthropicKey.trim() && !openaiKey.trim()) return;

    setSaveStatus("loading");
    setSaveMessage("");

    const body: Record<string, string> = {};
    if (anthropicKey.trim()) body.anthropicApiKey = anthropicKey.trim();
    if (openaiKey.trim()) body.openaiApiKey = openaiKey.trim();

    const res = await fetch("/api/admin/apikey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setSaveStatus("error");
      setSaveMessage(data.error ?? "保存に失敗しました");
    } else {
      setSaveStatus("success");
      setSaveMessage("APIキーを保存しました。すぐに反映されます。");
      if (anthropicKey.trim()) {
        setAnthropicStatus({ isSet: true, masked: anthropicKey.trim().slice(0, 10) + "••••••••••••••••••••" });
        setAnthropicKey("");
      }
      if (openaiKey.trim()) {
        setOpenaiStatus({ isSet: true, masked: openaiKey.trim().slice(0, 10) + "••••••••••••••••••••" });
        setOpenaiKey("");
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setPwdStatus("loading");
    setPwdMessage("");

    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ newPassword: newPassword.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setPwdStatus("error");
      setPwdMessage(data.error ?? "変更に失敗しました");
    } else {
      setPwdStatus("success");
      setPwdMessage("パスワードを変更しました。次回ログインから新しいパスワードが有効です。");
      setPassword(newPassword.trim()); // 現在のセッションのパスワードも更新
      setNewPassword("");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              管
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">管理画面</h1>
              <p className="text-xs text-gray-400">パスワードを入力してください</p>
            </div>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full rounded-xl border border-gray-200 p-3 text-base focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={!password}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              ログイン
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 text-center">
            初期パスワード: <code className="font-mono bg-gray-100 px-1 rounded">yuri-admin</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              管
            </div>
            <h1 className="text-base font-bold text-gray-800">管理画面</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/videos" className="text-sm text-blue-500 hover:underline">動画管理</a>
            <a href="/" className="text-sm text-blue-500 hover:underline">← アプリに戻る</a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Anthropic APIキー */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-gray-700">Anthropic APIキー</h2>
              <span className="text-xs text-gray-400">（英文添削に使用）</span>
            </div>

            <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${
              anthropicStatus.isSet
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-yellow-50 border border-yellow-100 text-yellow-700"
            }`}>
              {anthropicStatus.isSet
                ? <>設定済み: <span className="font-mono">{anthropicStatus.masked}</span></>
                : "未設定 — 添削機能が使えません"
              }
            </div>

            <label className="block text-sm text-gray-600 mb-2">
              {anthropicStatus.isSet ? "APIキーを更新する" : "APIキーを設定する"}
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-xl border border-gray-200 p-3 font-mono text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              Anthropic Console で発行したAPIキー（sk-ant- から始まる文字列）
            </p>
          </div>

          {/* OpenAI APIキー */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-gray-700">OpenAI APIキー</h2>
              <span className="text-xs text-gray-400">（音声入力のWhisperに使用・任意）</span>
            </div>

            <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${
              openaiStatus.isSet
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-gray-50 border border-gray-100 text-gray-500"
            }`}>
              {openaiStatus.isSet
                ? <>設定済み: <span className="font-mono">{openaiStatus.masked}</span></>
                : "未設定 — 音声入力はブラウザのWeb Speech APIを使用します"
              }
            </div>

            <label className="block text-sm text-gray-600 mb-2">
              {openaiStatus.isSet ? "APIキーを更新する" : "APIキーを設定する（任意）"}
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-xl border border-gray-200 p-3 font-mono text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              OpenAI Platform で発行したAPIキー（sk- から始まる文字列）。未設定でもブラウザの音声認識で動作します。
            </p>
          </div>

          {saveMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              saveStatus === "success"
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-red-50 border border-red-100 text-red-600"
            }`}>
              {saveMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={(!anthropicKey.trim() && !openaiKey.trim()) || saveStatus === "loading"}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saveStatus === "loading" ? "保存中…" : "APIキーを保存する"}
          </button>
        </form>

        {/* 管理者パスワード変更 */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-1">管理者パスワード変更</h2>
            <p className="text-xs text-gray-400">新しいパスワードを設定します。DBに保存されます。</p>
          </div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新しいパスワード（6文字以上）"
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {pwdMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              pwdStatus === "success"
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-red-50 border border-red-100 text-red-600"
            }`}>
              {pwdMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={!newPassword.trim() || pwdStatus === "loading"}
            className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {pwdStatus === "loading" ? "変更中…" : "パスワードを変更する"}
          </button>
        </form>

        {/* 補足 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm text-gray-500 space-y-2">
          <p className="font-semibold text-gray-700">注意事項</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>APIキーとパスワードはデータベースに保存されます</li>
            <li>保存後すぐに反映されます（再起動不要）</li>
            <li>このページのURLは他の人に共有しないでください</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
