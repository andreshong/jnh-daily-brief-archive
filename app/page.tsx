import ArchiveClient from "./ArchiveClient";

export const metadata = {
  title: "JNH PRESS Daily Brief 아카이브",
  description: "경쟁사·고객사·산업 뉴스 데일리 브리핑 아카이브입니다.",
};

export default function Page() {
  return <ArchiveClient />;
}
