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
        if (user.email && user.email.endsWith("@ghn.vn")) {
          return true;
        }
        // Chặn đăng nhập nếu không phải email @ghn.vn
        return "/login?error=AccessDenied"; 
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
