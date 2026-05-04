import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // 管理者フラグをセッションに付与
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        (session.user as { isAdmin?: boolean }).isAdmin = dbUser?.isAdmin ?? false;
      }
      return session;
    },
    async signIn({ user }) {
      // 管理者メールアドレスは自動でisAdmin=trueに
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { isAdmin: true },
        }).catch(() => null); // 初回ログイン前は無視
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
