import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Chỉ cho phép đăng nhập bằng Google và email đuôi @ghn.vn
      if (account?.provider === "google") {
        if (!user.email) return "/login?error=AccessDenied";
        
        // 1. Phải là email đuôi @ghn.vn
        if (!user.email.endsWith("@ghn.vn")) {
          return "/login?error=AccessDenied";
        }

        // 2. Phải nằm trong danh sách ALLOWED_EMAILS (nếu có cấu hình)
        const allowedEmailsStr = process.env.ALLOWED_EMAILS;
        if (allowedEmailsStr) {
          const allowedEmails = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
          if (!allowedEmails.includes(user.email.toLowerCase())) {
            return "/login?error=AccessDenied";
          }
        }

        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
