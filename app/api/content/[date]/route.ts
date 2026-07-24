import { NextRequest, NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = process.env.GITHUB_BRANCH || "main";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new NextResponse("잘못된 날짜 형식입니다.", { status: 400 });
  }

  try {
    // private repo도 지원하기 위해 raw.githubusercontent 대신 contents API(base64) 사용
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/archive/${date}.html?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return new NextResponse(
        `<div style="font-family:sans-serif;padding:40px;color:#666;">해당 날짜(${date})의 아카이브를 찾을 수 없습니다.</div>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const data = await res.json();
    const html = Buffer.from(data.content, "base64").toString("utf-8");

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return new NextResponse(
      `<div style="font-family:sans-serif;padding:40px;color:#666;">불러오는 중 오류가 발생했습니다.</div>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
