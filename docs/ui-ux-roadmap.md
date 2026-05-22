# v1.1.0 UI/UX 고도화 계획서

## 1. 문서 목적

- `v1.0.0`은 데이터베이스개론 제출 버전으로, **Node.js + Express + PostgreSQL + Prisma ORM** 기반 게시판 기능 구현과 검증에 초점을 둠.
- `v1.1.0`은 포트폴리오용 서비스형 커뮤니티로 보이도록 UI/UX 완성도를 높이는 고도화 버전으로 정의함.
- 기능 추가보다 사용성, 시각적 일관성, 모바일 경험, 상태 피드백 개선을 우선함.
- DB schema 변경 없이 `public/`의 HTML/CSS/Vanilla JS 중심 개선을 기본 원칙으로 삼음.

---

## 2. 현재 UI/UX 상태 요약

### 이미 구현된 요소

- 다크모드/라이트모드 전환 적용.
- 모바일 뷰포트 최적화 적용.
- 버튼, 카드, 링크 hover 효과 적용.
- 과제 정보와 GitHub, CWNU Smart Portal 링크를 포함한 footer 구성.
- 메인 페이지 도움말 투어 구현.
- 좋아요, 싫어요, 북마크 반응 버튼 UI 개선.
- 게시판 바로가기 영역과 인기글/공지사항/카테고리 이동 구조 구성.

### 아직 고도화할 수 있는 요소

- 토스트 알림 시스템 부재.
- 목록/상세/API 요청 중 로딩 상태 표현 부족.
- 검색 결과 없음, 북마크 없음, 작성 글 없음 같은 빈 상태 UI 보강 가능.
- API 실패 또는 권한 오류에 대한 에러 상태 UI 개선 가능.
- 모바일 게시글 목록을 테이블 대신 카드형으로 전환 가능.
- 삭제/회원 탈퇴 확인을 브라우저 기본 confirm 대신 커스텀 모달로 개선 가능.
- 마이페이지 활동 현황을 요약 카드로 제공 가능.
- 검색/정렬/필터 영역의 사용 흐름을 더 직관적으로 정리 가능.

---

## 3. v1.1.0 UI/UX 개선 후보

| 우선순위 | 개선 항목 | 설명 | 예상 수정 범위 | DB 변경 |
|---:|---|---|---|---|
| 1 | 디자인 시스템 정리 | 색상, spacing, radius, shadow, typography 기준을 CSS 변수와 공통 class로 정리 | `public/css/style.css` | 없음 |
| 2 | 공통 버튼/카드/입력창 스타일 통일 | 페이지별 버튼, 카드, 폼 요소의 크기와 상태 표현을 통일 | `public/css/style.css`, 필요한 HTML class | 없음 |
| 3 | 토스트 알림 시스템 | 저장, 삭제, 복사, 오류 발생 시 상단/하단 toast로 피드백 제공 | `public/js/auth.js`, `public/js/posts.js`, `public/js/mypage.js`, CSS | 없음 |
| 4 | 로딩/빈 상태/에러 상태 UI | 목록 로딩, 검색 결과 없음, API 실패 상태를 화면 안에서 명확히 표시 | `public/js/posts.js`, `public/js/mypage.js`, CSS | 없음 |
| 5 | 모바일 카드형 게시글 목록 | 좁은 화면에서 테이블 대신 카드형 목록을 제공해 가독성 개선 | `public/index.html`, `public/js/posts.js`, CSS | 없음 |
| 6 | 삭제/회원 탈퇴 커스텀 모달 | 기본 confirm을 서비스형 모달로 대체해 위험 작업 인지 강화 | HTML, `public/js/posts.js`, `public/js/mypage.js`, CSS | 없음 |
| 7 | 마이페이지 활동 요약 카드 | 작성 글, 댓글, 북마크, 좋아요, 싫어요 개수를 요약 카드로 표시 | `public/mypage.html`, `public/js/mypage.js`, CSS | 없음 |
| 8 | 검색/정렬/필터 UX 개선 | 현재 게시판 상태, 검색어, 정렬 조건을 더 명확히 표시 | `public/index.html`, `public/js/posts.js`, CSS | 없음 |
| 9 | 게시글 상세 가독성 개선 | 본문 줄간격, 메타 정보, 반응 버튼 그룹, 댓글 영역 시각 구조 개선 | `public/post-detail.html`, `public/js/posts.js`, CSS | 없음 |
| 10 | 접근성 개선 | focus-visible, aria-label, 키보드 조작, 색 대비를 보강 | HTML, CSS, JS | 없음 |
| 11 | 스크린샷/GIF 재정리 | v1.1.0 UI 기준 README/기능 설명서 대표 화면 재촬영 | `docs/screenshots/` 문서 자산 | 없음 |

---

## 4. 추천 구현 순서

1. 디자인 시스템 정리.
2. 토스트 알림 추가.
3. 로딩/빈 상태/에러 상태 추가.
4. 모바일 카드형 게시글 목록 추가.
5. 커스텀 확인 모달 추가.
6. 마이페이지 대시보드화.
7. 최종 스크린샷/GIF 재촬영.
8. README/feature-guide 업데이트.

---

## 5. 구현 단위별 Codex 작업 기준

| 작업 | 목표 | 권장 수정 범위 | 검증 기준 |
|---|---|---|---|
| 작업 1 | CSS 디자인 토큰 정리 | `public/css/style.css` | 주요 페이지 라이트/다크모드 색상 유지 |
| 작업 2 | Toast UI 추가 | 공통 JS 또는 기존 JS 최소 수정, CSS | 로그인, 저장, 삭제, 공유 복사 피드백 확인 |
| 작업 3 | 목록 loading/empty/error 상태 추가 | `public/js/posts.js`, `public/js/mypage.js` | 검색 결과 없음, API 실패 상황 표시 확인 |
| 작업 4 | 모바일 카드형 목록 추가 | `public/index.html`, `public/js/posts.js`, CSS | 360px 뷰포트에서 목록 가독성 확인 |
| 작업 5 | 삭제 확인 modal 추가 | `public/post-detail.html`, `public/mypage.html`, JS, CSS | 게시글 삭제, 댓글 삭제, 회원 탈퇴 동작 유지 |
| 작업 6 | 마이페이지 요약 카드 추가 | `public/mypage.html`, `public/js/mypage.js`, CSS | activity 응답 구조 변경 없이 렌더링 확인 |
| 작업 7 | 접근성 보강 | HTML, CSS, JS | 키보드 focus와 다크모드 대비 확인 |
| 작업 8 | 문서/스크린샷 갱신 | README, feature-guide, screenshots | v1.1.0 화면과 문서 불일치 제거 |

---

## 6. 스크린샷 전략

- 기능 구현 완료 후 한 번에 스크린샷과 GIF를 재촬영함.
- `docs/screenshots/raw/`에는 원본 캡처를 보존함.
- `docs/screenshots/99-final/`에는 README 대표 이미지와 GIF만 배치함.
- `docs/feature-guide.md`에는 기능별 폴더의 정적 캡처를 사용함.
- 새로 필요한 스크린샷 목록은 v1.1.0 구현 완료 후 `screenshot-map.csv` 기준으로 다시 정리함.
- 모바일 화면은 메인, 목록, 상세, 마이페이지, 다크모드 중심으로 재촬영함.

---

## 7. v1.1.0에서 하지 않을 것

| 제외 항목 | 제외 이유 |
|---|---|
| CI/CD 구축 | 현재 목표가 UI/UX 고도화이며 자동화 파이프라인은 별도 단계에 적합함 |
| 대규모 API 문서화 | 기존 기능 설명서와 README로 제출/포트폴리오 설명 가능함 |
| TypeScript 전환 | 전체 코드 구조 변경이 커서 UI/UX 고도화 범위를 벗어남 |
| React/Next.js 전환 | 현재 프로젝트는 HTML/CSS/Vanilla JS 기반 과제 구조를 유지함 |
| 이미지 업로드 | DB schema와 파일 저장 전략이 필요한 기능으로 별도 버전에 적합함 |
| 알림 DB 기능 | 새 테이블과 이벤트 설계가 필요해 UI 개선 범위를 벗어남 |
| 관리자/신고 기능 | 권한 모델과 DB 구조 확장이 필요해 별도 버전에서 진행하는 것이 적절함 |

---

## 8. 결론

- `v1.1.0`의 목적은 운영 가능한 서비스처럼 보이는 게시판 UI/UX 완성도 강화임.
- 기능 수를 늘리는 것보다 사용자가 상태를 이해하고 자연스럽게 이동할 수 있는 화면 흐름을 만드는 데 집중함.
- DB 구조 변경이 큰 기능은 제외하고, 기존 기능을 더 명확하고 안정적으로 보이게 만드는 방향으로 진행함.
- 우선순위는 디자인 시스템, 피드백 UI, 상태 UI, 모바일 경험, 문서/스크린샷 정리 순서로 설정함.
