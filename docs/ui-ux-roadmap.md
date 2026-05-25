# v1.2.0 UI/UX 고도화 및 확장 로드맵

## 1. 문서 목적

- `v1.1.0`과 `v1.2.0`에서 진행한 CWNU Community UI/UX 개선 작업의 완료 상태를 정리함.
- 기능 추가보다 사용성, 정보 탐색, 모바일 접근성, 상태 피드백, 문서 증빙 완성도를 기준으로 정리함.
- DB schema, migration, API 응답 구조는 유지하고 HTML/CSS/Vanilla JS와 문서 자산 중심으로 고도화함.
- 이후 작업은 운영 기능 확장, 테스트 자동화, 접근성 전문 점검처럼 별도 범위가 필요한 항목으로 분리함.

---

## 2. 현재 완료 상태 요약

| 버전 | 상태 | 핵심 결과 |
|---|---|---|
| `v1.0.0` | 완료 | Node.js + Express + PostgreSQL + Prisma ORM 기반 게시판 기능 구현 |
| `v1.1.0` | 완료 | 디자인 시스템, Toast, Confirm Modal, 모바일 카드형 목록, 마이페이지 대시보드, 상세 화면 UX 고도화 |
| `v1.2.0` | 완료 | 글쓰기 UX, Skeleton Loading, 검색 UX, Floating 글쓰기 버튼, 활동 시각화, 상세 읽기 UX, 메인 대시보드 polish, 시연 seed 데이터 반영 |
| `v1.2.0` 문서 자산 | 완료 | 최신 PNG/GIF를 `raw-v1.2.0`으로 분리하고 README/feature-guide 대표 이미지 갱신 |

---

## 3. v1.1.0 완료 항목

| 항목 | 완료 내용 | 주요 범위 |
|---|---|---|
| 디자인 시스템 정리 | CSS 변수, card/button/input/table 스타일, 라이트/다크모드 토큰 정리 | `public/css/style.css` |
| Toast UI | 저장, 삭제, 공유, 오류 피드백을 toast로 제공 | `public/js/auth.js`, CSS |
| 모바일 카드형 목록 | 모바일에서 게시글 table 대신 card list 중심으로 표시 | `public/index.html`, `public/js/posts.js`, CSS |
| 커스텀 Confirm Modal | 게시글/댓글/답글 삭제, 회원 탈퇴 확인 UI 개선 | `public/js/auth.js`, `public/js/posts.js`, `public/js/mypage.js` |
| 마이페이지 대시보드 | 프로필 요약, 활동 통계, 최근 활동 영역 추가 | `public/mypage.html`, `public/js/mypage.js` |
| 게시글 상세 UX | 상세 헤더, 본문, 반응/액션, 댓글 영역 가독성 개선 | `public/post-detail.html`, `public/js/posts.js` |
| 로딩 피드백 | spinner와 버튼 pending 상태 추가 | 공통 JS/CSS |
| 검색/필터/보기 모드 | filter summary, result summary, table/card 보기 전환 추가 | `public/index.html`, `public/js/posts.js` |
| 메인 대시보드 | hero, 요약 카드, Hot/Notice/Latest 프리뷰, 최근 본 글 추가 | `public/index.html`, `public/js/posts.js` |
| 안정화 | 중복 스타일/헬퍼, 접근성, 모바일, 다크모드 회귀 위험 점검 | 프론트 JS/CSS/HTML |

---

## 4. v1.2.0 완료 항목

| 항목 | 완료 내용 | 주요 범위 |
|---|---|---|
| 글쓰기 UX 고도화 | 카테고리별 작성 가이드, placeholder, 글자 수 카운터, 작성/미리보기 탭, localStorage 임시저장, 작성 중 나가기 경고 추가 | `public/post-write.html`, `public/js/posts.js`, CSS |
| Skeleton Loading | 메인 대시보드, 게시글 목록 table/card, 게시글 상세, 마이페이지 대시보드 로딩 골격 UI 추가 | `public/js/posts.js`, `public/js/mypage.js`, CSS |
| 검색 UX 추가 고도화 | 검색어 지우기 버튼, 최근 검색어 chip, 검색어 하이라이트, result summary 정리 | `public/index.html`, `public/js/posts.js`, CSS |
| 모바일 Floating 글쓰기 버튼 | 모바일 오른쪽 아래 글쓰기 FAB 추가, 로그인/비로그인 흐름 유지 | `public/index.html`, `public/js/posts.js`, CSS |
| 마이페이지 활동 시각화 | 최근 활동 타임라인, 활동 유형 배지, 많이 활동한 게시판 Top 3 추가 | `public/mypage.html`, `public/js/mypage.js`, CSS |
| 게시글 상세 읽기 UX | 댓글 이동 버튼, 맨 위 이동 버튼, 읽기 진행 보조 UI, 상세 헤더 정보 위계 정리 | `public/post-detail.html`, `public/js/posts.js`, CSS |
| 메인 대시보드 polish | 도움말 CTA, 카테고리 카드 색상, Hot/Notice/Latest 프리뷰 색상 체계 보완 | `public/index.html`, CSS |
| 최종 시연 seed 데이터 | v1.2.0 UI/UX를 잘 보여주는 users/posts/comments/replies/likes/dislikes/bookmarks 데이터 재구성 | `scripts/seed-dev.js`, `README.md` |
| 문서 최신화 | feature-guide와 ai-usage를 v1.2.0 현재 기능 기준으로 갱신 | `docs/feature-guide.md`, `docs/ai-usage.md` |
| 스크린샷/GIF 정리 | 최신 캡처를 `raw-v1.2.0`에 분리하고 README/feature-guide 이미지 경로 갱신 | `README.md`, `docs/screenshots/*`, `docs/feature-guide.md` |

---

## 5. 스크린샷/GIF 정리 기준

- 기존 `docs/screenshots/raw/`는 과거 원본 보존용으로 유지함.
- v1.2.0 최신 원본은 `docs/screenshots/raw-v1.2.0/`에 별도로 보존함.
- README 대표 미리보기는 `docs/screenshots/99-final/`의 GIF와 PNG를 사용함.
- 기능 설명서는 `01-auth`, `02-posts`, `03-comments`, `04-likes`, `05-pagination-sort`, `06-database` 기능별 폴더 이미지를 사용함.

---

## 6. 다음 후보 작업

| 후보 | 설명 |
|---|---|
| 관리자/신고 기능 | 운영자 권한, 신고 처리, 숨김/삭제 정책 설계 필요 |
| 알림 기능 | 댓글/답글/반응 알림과 읽음 상태 모델 설계 필요 |
| 이미지 업로드 | 파일 저장 위치, 용량 제한, 보안 검사, DB 모델 확장 필요 |
| API/e2e 자동화 테스트 | 주요 API와 브라우저 흐름을 자동화해 회귀 위험 감소 |
| 접근성/Lighthouse 전문 점검 | 색 대비, 키보드 접근, 모바일 성능을 정량 지표로 점검 |
| CSS/JS 역할 분리 | Vanilla JS 파일이 커졌으므로 기능 단위 모듈화 검토 |
| 운영 환경 보안 강화 | Vercel/Neon 환경변수, cookie 옵션, 운영 seed 차단 정책 추가 점검 |

---

## 7. 제외 및 후속 분리 기준

- DB schema, migration, API 응답 구조 변경이 필요한 작업은 v1.2.0 UI/UX 범위에서 제외함.
- 신규 의존성 도입, React/Next.js 전환, TypeScript 전환은 별도 대규모 작업으로 분리함.
- 스크린샷/GIF는 최신 캡처 반영을 완료했지만, 향후 기능 추가 시 버전별 raw 폴더를 새로 분리해 관리함.
- 운영 데이터와 개발 seed 데이터는 분리해 다루며, seed 실행은 명시적 확인이 있을 때만 수행함.

---

## 8. 결론

- `v1.1.0`은 기본 게시판을 서비스형 UI로 보이게 만드는 고도화 단계로 완료함.
- `v1.2.0`은 글쓰기, 검색, 상세 읽기, 마이페이지 활동, 모바일 접근성, 로딩 경험, 문서 증빙까지 확장한 단계로 완료함.
- 다음 단계는 새로운 UI polish보다 운영 기능, 자동화 테스트, 접근성/성능 검수처럼 제품 안정성을 높이는 작업이 적합함.
