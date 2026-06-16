import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getWhitelistFromServer } from "@/lib/whitelistDb";

// Helper to check if email exists in the server-side whitelist database
async function checkEmailInServerWhitelist(email: string): Promise<boolean> {
  try {
    const whitelist = await getWhitelistFromServer();
    if (whitelist && Array.isArray(whitelist)) {
      return whitelist.some(
        (item: any) => item.email && item.email.toLowerCase() === email.toLowerCase()
      );
    }
  } catch (e) {
    console.error("Failed to read server whitelist", e);
  }
  
  // Hardcoded fallback list if the database read fails
  const fallbacks = [
    "tuanla@ghn.vn",
    "admin.ees@ghn.vn",
    "ex-executives@scommerce.asia",
    "ops.leader@ghn.vn",
    "ceo.office@scommerce.asia",
    "hongnx@ghn.vn"
  ];
  return fallbacks.includes(email.toLowerCase());
}

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

        // 2. Phải nằm trong Whitelist
        const isWhitelisted = await checkEmailInServerWhitelist(email);
        if (!isWhitelisted) {
          // Check if email is in the ALLOWED_EMAILS environment variable configuration
          const allowedEmailsStr = process.env.ALLOWED_EMAILS;
          if (allowedEmailsStr) {
            const allowed = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
            if (allowed.includes(email)) {
              return {
                id: email,
                name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
                email: email,
              };
            }
          }
          return null; // Deny (Chưa được phân quyền)
        }

        // 3. Phải nằm trong danh sách ALLOWED_EMAILS (nếu có cấu hình)
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
        const email = user.email.toLowerCase().trim();
        
        // 1. Phải là email đuôi @ghn.vn hoặc @scommerce.asia
        if (!email.endsWith("@ghn.vn") && !email.endsWith("@scommerce.asia")) {
          return "/login?error=AccessDenied";
        }

        // 2. Phải nằm trong Whitelist
        const isWhitelisted = await checkEmailInServerWhitelist(email);
        if (!isWhitelisted) {
          // Check if email is in the ALLOWED_EMAILS environment variable configuration
          const allowedEmailsStr = process.env.ALLOWED_EMAILS;
          if (allowedEmailsStr) {
            const allowed = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
            if (allowed.includes(email)) {
              return true;
            }
          }
          return "/login?error=NotAuthorized";
        }

        // 3. Phải nằm trong danh sách ALLOWED_EMAILS (nếu có cấu hình)
        const allowedEmailsStr = process.env.ALLOWED_EMAILS;
        if (allowedEmailsStr) {
          const allowedEmails = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
          if (!allowedEmails.includes(email)) {
            return "/login?error=AccessDenied";
          }
        }

        return true;
      }
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
