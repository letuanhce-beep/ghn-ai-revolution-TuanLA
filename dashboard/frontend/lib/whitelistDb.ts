import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "whitelist.json");

// Default fallback whitelist
export const defaultWhitelist = [
  { email: "tuanla@ghn.vn", role: "HR_EX", scope: "" },
  { email: "admin.ees@ghn.vn", role: "HR_EX", scope: "" },
  { email: "ex-executives@scommerce.asia", role: "HR_EX", scope: "" },
  { email: "ceo.office@scommerce.asia", role: "KHOI_LEADER", scope: "" },
  { email: "ops.leader@ghn.vn", role: "KHOI_LEADER", scope: "VH" },
  { email: "hongnx@ghn.vn", role: "KHOI_LEADER", scope: "" }
];

export async function getWhitelistFromServer(): Promise<any[]> {
  // 1. Try Vercel KV if configured
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/ees-whitelist`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        },
        cache: "no-store"
      });
      if (res.ok) {
        const body = await res.json();
        if (body.result) {
          return JSON.parse(body.result);
        }
      }
    } catch (e) {
      console.error("Vercel KV read error:", e);
    }
  }

  // 2. Fallback to local file read
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Local file read error:", e);
  }

  return defaultWhitelist;
}

export async function saveWhitelistToServer(list: any[]): Promise<boolean> {
  let saved = false;

  // 1. Try Vercel KV if configured
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/set/ees-whitelist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        },
        body: JSON.stringify(JSON.stringify(list))
      });
      if (res.ok) {
        saved = true;
      }
    } catch (e) {
      console.error("Vercel KV write error:", e);
    }
  }

  // 2. Try writing local file (for localhost persistence)
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf8");
    saved = true;
  } catch (e) {
    console.warn("Local file write error (expected on Vercel read-only filesystem):", e);
  }

  return saved;
}
