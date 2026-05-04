"use client";

import { useEffect, useState } from "react";
import { CorrectionPoint } from "@/app/api/correct/route";

interface UserHistory {
  id: string;
  originalText: string;
  correctedText: string;
  level: string;
  points: CorrectionPoint[];
  hasImage: boolean;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
  histories: UserHistory[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error("アクセス権限がありません");
        return r.json();
      })
      .then(setUsers)
      .catch((e) => setError(e.message))
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">管</div>
            <h1 className="text-base font-bold text-gray-800">ユーザー履歴管理</h1>
          </div>
          <a href="/admin" className="text-sm text-blue-500 hover:underline">← 管理画面</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading && <p className="text-center text-gray-400 py-16">読み込み中…</p>}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{users.length}名のユーザー</p>

            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* ユーザーヘッダー */}
                <button
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {user.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {user.name ?? "名前なし"}
                      {user.isAdmin && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">管理者</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold text-blue-600">{user.histories.length}回</p>
                    <p className="text-xs text-gray-400">添削</p>
                  </div>
                  <span className="text-gray-300 ml-2">{expandedUser === user.id ? "▲" : "▼"}</span>
                </button>

                {/* 履歴一覧 */}
                {expandedUser === user.id && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {user.histories.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">履歴なし</p>
                    ) : (
                      user.histories.map((h) => (
                        <div key={h.id}>
                          <button
                            onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 truncate">
                                {h.hasImage ? "📷 " : ""}{h.originalText || "（画像添削）"}
                              </p>
                              <p className="text-xs text-green-600 truncate mt-0.5">{h.correctedText}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                h.level === "beginner" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                              }`}>
                                {h.level === "beginner" ? "初心者" : "中級者"}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(h.createdAt)}</p>
                            </div>
                          </button>

                          {/* 修正ポイント詳細 */}
                          {expandedHistory === h.id && h.points.length > 0 && (
                            <div className="px-4 pb-3 space-y-2">
                              {h.points.map((p, i) => (
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
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
