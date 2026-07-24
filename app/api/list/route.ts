import { NextResponse } from "next/server";

export const revalidate = 0; // 항상 최신 목록 조회

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN; // private repo인 경우 필요
const BRANCH = process.env.GITHUB_BRANCH || "main";
const DIR = "archive";

export async function GET() {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
      },
      // GitHub API 결과를 60초 캐시
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // archive 폴더가 아직 없는 경우 (첫 저장 전)
        return NextResponse.json({ dates: [] });
      }
      const text = await res.text();
      return NextResponse.json(
        { error: `GitHub API 오류 (${res.status})`, detail: text },
        { status: 502 }
      );
    }

    const files: { name: string }[] = await res.json();
    const dates = files
      .map((f) => f.name.replace(/\.html$/, ""))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort((a, b) => (a < b ? 1 : -1)); // 최신순

    return NextResponse.json({ dates });
  } catch (e) {
    return NextResponse.json(
      { error: "목록을 불러오지 못했습니다.", detail: String(e) },
      { status: 500 }
    );
  }
}
