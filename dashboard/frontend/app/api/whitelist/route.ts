import { NextResponse } from "next/server";
import { getWhitelistFromServer, saveWhitelistToServer } from "@/lib/whitelistDb";

export async function GET() {
  const list = await getWhitelistFromServer();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    if (!item || !item.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = item.email.trim().toLowerCase();
    const list = await getWhitelistFromServer();

    if (list.some((i: any) => i.email.toLowerCase() === email)) {
      return NextResponse.json({ error: "Email này đã có trong danh sách uỷ quyền" }, { status: 400 });
    }

    const newList = [...list, {
      email,
      role: item.role || "KHOI_LEADER",
      scope: item.scope || ""
    }];

    await saveWhitelistToServer(newList);
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

    const list = await getWhitelistFromServer();
    const newList = list.filter((i: any) => i.email.toLowerCase() !== emailClean);

    await saveWhitelistToServer(newList);
    return NextResponse.json({ success: true, list: newList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete email" }, { status: 500 });
  }
}
