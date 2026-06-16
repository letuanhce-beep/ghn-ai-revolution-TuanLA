import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "whitelist.json");

// Default fallback whitelist
const defaultWhitelist = [
  { email: "tuanla@ghn.vn", role: "HR_EX", scope: "" },
  { email: "admin.ees@ghn.vn", role: "HR_EX", scope: "" },
  { email: "ex-executives@scommerce.asia", role: "HR_EX", scope: "" },
  { email: "ceo.office@scommerce.asia", role: "KHOI_LEADER", scope: "" },
  { email: "ops.leader@ghn.vn", role: "KHOI_LEADER", scope: "VH" },
  { email: "hongnx@ghn.vn", role: "HR_EX", scope: "" }
];

// In-memory fallback cache to support Vercel serverless persistence during active runtime
let memoryWhitelist: any[] | null = null;

function loadWhitelist() {
  if (memoryWhitelist) return memoryWhitelist;
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      memoryWhitelist = JSON.parse(data);
      return memoryWhitelist!;
    }
  } catch (e) {
    console.error("Failed to read whitelist.json file", e);
  }
  memoryWhitelist = [...defaultWhitelist];
  return memoryWhitelist;
}

function saveWhitelist(list: any[]) {
  memoryWhitelist = list;
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf8");
    return true;
  } catch (e) {
    console.warn("Writing whitelist.json failed (expected in Vercel environments):", e);
    return false;
  }
}

export async function GET() {
  const list = loadWhitelist();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    if (!item || !item.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = item.email.trim().toLowerCase();
    const list = loadWhitelist();

    if (list.some((i: any) => i.email.toLowerCase() === email)) {
      return NextResponse.json({ error: "Email này đã có trong danh sách uỷ quyền" }, { status: 400 });
    }

    const newList = [...list, {
      email,
      role: item.role || "KHOI_LEADER",
      scope: item.scope || ""
    }];

    saveWhitelist(newList);
    return NextResponse.json({ success: true, list: newList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add email" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    if (emailClean === "tuanla@ghn.vn") {
      return NextResponse.json({ error: "Không thể xóa tài khoản Admin hệ thống" }, { status: 400 });
    }

    const list = loadWhitelist();
    const newList = list.filter((i: any) => i.email.toLowerCase() !== emailClean);

    saveWhitelist(newList);
    return NextResponse.json({ success: true, list: newList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete email" }, { status: 500 });
  }
}
