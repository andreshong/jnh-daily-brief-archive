"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

const COLORS = {
  darkGreen: "#1E3932",
  green: "#00704A",
  cream: "#F2F0EB",
  brown: "#C67C4E",
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function toDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 해당 날짜가 속한 주(월~금)의 날짜 목록(ISO)을 반환
function weekRange(d: Date) {
  const day = d.getDay(); // 0=일 ... 6=토
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    days.push(toISO(cur));
  }
  return days;
}

function weekLabel(d: Date) {
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const offset = firstOfMonth.getDay() === 0 ? 6 : firstOfMonth.getDay() - 1; // 월요일 기준 오프셋
  const weekOfMonth = Math.ceil((d.getDate() + offset) / 7);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${weekOfMonth}주차`;
}

export default function ArchiveClient() {
  const [dates, setDates] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setDates(data.dates || []);
        if (data.dates && data.dates.length > 0) {
          setSelected(data.dates[0]); // 최신 날짜
        }
      })
      .catch(() => setError("아카이브 목록을 불러오지 못했습니다."));
  }, []);

  const dateSet = useMemo(() => new Set(dates || []), [dates]);

  const currentWeekDays = useMemo(() => {
    if (!selected) return [];
    return weekRange(toDate(selected));
  }, [selected]);

  const currentLabel = selected ? weekLabel(toDate(selected)) : "";

  function moveWeek(delta: number) {
    if (!selected) return;
    const d = toDate(selected);
    d.setDate(d.getDate() + delta * 7);
    // 이동한 주의 월~금 중 아카이브가 있는 첫 날짜를 선택
    const days = weekRange(d);
    const found = days.find((x) => dateSet.has(x));
    setSelected(found || days[0]);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.cream,
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif",
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          background: COLORS.darkGreen,
          color: "#fff",
          padding: "28px 20px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 1,
              color: COLORS.brown,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            JNH PRESS · 인사팀
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Daily Brief 아카이브
          </h1>
          <p style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
            경쟁사·고객사·산업 뉴스 데일리 브리핑을 다시 볼 수 있습니다.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        {error && (
          <div
            style={{
              background: "#fff",
              border: `1px solid ${COLORS.brown}`,
              borderRadius: 8,
              padding: 20,
              color: "#555",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!error && dates && dates.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 30,
              textAlign: "center",
              color: "#888",
              fontSize: 14,
            }}
          >
            아직 저장된 아카이브가 없습니다. 첫 브리핑이 발송되면 이곳에 표시됩니다.
          </div>
        )}

        {!error && dates && dates.length > 0 && (
          <>
            {/* 주차 네비게이션 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => moveWeek(-1)}
                aria-label="이전 주"
                style={navBtnStyle}
              >
                ‹
              </button>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.darkGreen }}>
                {currentLabel}
              </div>
              <button
                onClick={() => moveWeek(1)}
                aria-label="다음 주"
                style={navBtnStyle}
              >
                ›
              </button>
            </div>

            {/* 요일 칩 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {currentWeekDays.map((iso) => {
                const has = dateSet.has(iso);
                const isSel = iso === selected;
                const d = toDate(iso);
                return (
                  <button
                    key={iso}
                    disabled={!has}
                    onClick={() => setSelected(iso)}
                    style={{
                      padding: "10px 4px",
                      borderRadius: 8,
                      border: `1px solid ${
                        isSel ? COLORS.green : has ? "#ddd" : "#eee"
                      }`,
                      background: isSel ? COLORS.green : "#fff",
                      color: isSel ? "#fff" : has ? "#333" : "#ccc",
                      cursor: has ? "pointer" : "default",
                      fontSize: 12,
                      fontWeight: isSel ? 700 : 500,
                    }}
                  >
                    <div>{DOW[d.getDay()]}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>

            {/* 본문 뷰어 */}
            {selected && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #e5e2da",
                }}
              >
                <iframe
                  key={selected}
                  src={`/api/content/${selected}`}
                  title={`Daily Brief ${selected}`}
                  style={{ width: "100%", height: "80vh", border: "none" }}
                />
              </div>
            )}
          </>
        )}

        {!error && dates === null && (
          <div style={{ textAlign: "center", color: "#999", padding: 40, fontSize: 14 }}>
            불러오는 중...
          </div>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#999",
          padding: "20px 20px 40px",
        }}
      >
        본 아카이브는 JNH Press 인사팀이 관리합니다.
      </footer>
    </div>
  );
}

const navBtnStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #ddd",
  background: "#fff",
  color: COLORS.darkGreen,
  fontSize: 18,
  cursor: "pointer",
};
