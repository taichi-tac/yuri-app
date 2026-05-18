import { auth, signOut } from "@/auth";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const session = await auth();
  const user = session?.user ?? null;
  const isAdmin = (session?.user as { isAdmin?: boolean } | null)?.isAdmin ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            Y
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-800">Study Bubble AI</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="/history" className="text-xs text-blue-500 hover:underline">履歴</a>
            {isAdmin && (
              <a href="/admin/users" className="text-xs text-gray-500 hover:underline">管理</a>
            )}
            {user?.image && (
              <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
            )}
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button type="submit" className="text-xs text-gray-400 hover:text-gray-600">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <HomeClient />
    </div>
  );
}
