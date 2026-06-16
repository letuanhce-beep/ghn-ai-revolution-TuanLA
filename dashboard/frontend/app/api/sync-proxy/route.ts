import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Định dạng URL không hợp lệ" }, { status: 400 });
    }

    // Security check: Only allow http and https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Chỉ cho phép giao thức http và https" }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "text/csv, application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Không thể lấy dữ liệu: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const content = await response.text();
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Proxy fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ khi kết nối đến URL bên ngoài" },
      { status: 500 }
    );
  }
}
