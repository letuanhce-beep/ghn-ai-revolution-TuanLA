import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.trim().toLowerCase();
        
        // 1. Phải là email đuôi @ghn.vn hoặc @scommerce.asia
        if (!email.endsWith("@ghn.vn") && !email.endsWith("@scommerce.asia")) {
          return null; // Deny
        }

        // 2. Phải nằm trong danh sách ALLOWED_EMAILS (nếu có cấu hình)
        const allowedEmailsStr = process.env.ALLOWED_EMAILS;
        if (allowedEmailsStr) {
          const allowedEmails = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
          if (!allowedEmails.includes(email)) {
            return null; // Deny
          }
        }

        return {
          id: email,
          name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
          email: email,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return "/login?error=AccessDenied";
        
        // 1. Phải là email đuôi @ghn.vn hoặc @scommerce.asia
        if (!user.email.endsWith("@ghn.vn") && !user.email.endsWith("@scommerce.asia")) {
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
      // Cho phép Credentials provider đi qua vì đã check ở authorize
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

