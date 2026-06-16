import { NextResponse } from "next/server";
import { getWhitelistFromServer, saveWhitelistToServer } from "@/lib/whitelistDb";

export async function GET() {
  const list = await getWhitelistFromServer();
  const isPersistent = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  return NextResponse.json({ list, isPersistent });
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    if (!item || !item.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = item.email.trim().toLowerCase();
    const list = await getWhitelistFromServer();

    const existingIndex = list.findIndex((i: any) => i.email.toLowerCase() === email);
    let newList;
    if (existingIndex >= 0) {
      newList = [...list];
      newList[existingIndex] = {
        email,
        role: item.role || "KHOI_LEADER",
        scope: item.scope || ""
      };
    } else {
      newList = [...list, {
        email,
        role: item.role || "KHOI_LEADER",
        scope: item.scope || ""
      }];
    }

    await saveWhitelistToServer(newList);
    const isPersistent = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    return NextResponse.json({ success: true, list: newList, isPersistent });
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

    const list = await getWhitelistFromServer();
    const newList = list.filter((i: any) => i.email.toLowerCase() !== emailClean);

    await saveWhitelistToServer(newList);
    const isPersistent = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    return NextResponse.json({ success: true, list: newList, isPersistent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete email" }, { status: 500 });
  }
}
