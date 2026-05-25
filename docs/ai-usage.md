# AI 활용 명시 문서

## 목차

- [1. 문서 목적](#1-문서-목적)
- [2. 사용한 AI 도구](#2-사용한-ai-도구)
- [3. AI 활용 범위](#3-ai-활용-범위)
- [4. 사람이 직접 수행한 검토](#4-사람이-직접-수행한-검토)
- [5. AI 활용 시 주의한 점](#5-ai-활용-시-주의한-점)

---

## 1. 문서 목적

본 문서는 데이터베이스개론 과제 제출 시 `CWNU Community 게시판 시스템` 개발 과정에서 AI를 활용한 사실과 활용 범위를 명확히 밝히기 위한 문서임.

AI는 프로젝트 구현을 대신하는 주체가 아니라, 설계 검토, 구현 보조, 오류 분석, UI/UX 개선안 정리, 문서화, 검증 체크리스트 작성에 활용한 보조 도구임.

v1.2.0 이후 v2.0.0 계정 구조 리팩터링 작업에서도 ChatGPT와 Codex를 함께 사용하여 기능 단위 작업을 Issue/branch/commit/PR/merge 흐름으로 관리하고, 사용자가 최종 브라우저 화면과 배포 상태를 직접 확인하는 방식으로 진행함.

## 2. 사용한 AI 도구

| 도구 | 활용 목적 |
|---|---|
| ChatGPT | 작업 순서 설계, Codex 작업 프롬프트 작성, 위험 요소 판단, 문서 구조화, 검증 항목 정리 |
| OpenAI Codex | 레포 파일 수정, UI/UX 개선 적용, seed 데이터 재구성, 검증 명령 실행, GitHub Issue/PR/merge 자동화 보조 |

## 3. AI 활용 범위

| 활용 항목 | 활용 내용 |
|---|---|
| 프로젝트 구조 설계 보조 | Node.js + Express + Prisma 기반 폴더 구조와 기능 구현 순서 정리 |
| Express/Prisma 기반 API 구현 보조 | 인증, 게시글, 댓글, 반응, 마이페이지 관련 API 구현 방향 검토 |
| DB relation, cascade 삭제, unique 제약 검토 보조 | User, Post, Comment, Like, Dislike, Bookmark 관계와 삭제 정책 검토 |
| 계정 구조 리팩터링 보조 | email 기반 계정 식별자를 loginId로 전환하고 비밀번호 변경 API/UI를 추가하는 영향 범위 검토 |
| UI/UX 개선 보조 | 디자인 시스템, Toast, Confirm Modal, Skeleton Loading, 검색 UX, 글쓰기 UX, 마이페이지 활동 시각화, 게시글 상세 UX 개선 방향 정리 |
| seed 데이터 재구성 보조 | v1.2.0 시연용 사용자, 게시글, 댓글/답글, 좋아요/싫어요, 북마크, 익명/수정됨 데이터 분포 설계 |
| 오류 원인 분석 및 해결 방향 제안 | 라우팅, 권한 검증, UI 예외 처리, Prisma 관련 문제, CSS selector 적용 문제 해결 방향 제안 |
| 회귀 테스트 체크리스트 작성 보조 | 회원가입, 로그인, 게시글, 댓글/답글, 반응, 북마크, 마이페이지, 다크모드, 모바일, localStorage 기능별 검증 항목 정리 |
| 문서 작성 보조 | README, `docs/feature-guide.md`, `docs/ai-usage.md`, `docs/ui-ux-roadmap.md` 문서 구조와 문장 정리 |
| GitHub 작업 흐름 보조 | Issue 생성, assignee 지정, branch 작업, commit, PR 생성, `Closes #이슈번호`, Related PR 명시, squash merge, branch 정리 |
| 검증 명령 실행 보조 | `node --check`, `npx prisma validate`, `npm run prisma:generate`, `git diff --check`, API smoke test 결과 정리 |

## 4. 사람이 직접 수행한 검토

| 검토 항목 | 직접 수행한 내용 |
|---|---|
| 브라우저 기능 확인 | 회원가입, 로그인, 게시글 작성/조회/수정/삭제, 댓글/답글, 반응, 검색, 마이페이지, 다크모드, 모바일 화면을 브라우저에서 확인 |
| Vercel 배포 확인 | main merge 후 Vercel Production Deployment 상태와 배포 사이트 동작을 확인 |
| GitHub Release 관리 | 태그 생성 이후 GitHub Release 생성 여부를 확인하고, 필요한 경우 Release를 수동 생성 |
| 스크린샷/GIF 촬영 | README와 기능 설명서에 사용할 최종 캡처와 GIF는 사용자가 직접 촬영하고 선별 |
| Prisma Studio 확인 | DB에 저장된 사용자, 게시글, 댓글/답글, 좋아요, 싫어요, 북마크 데이터 확인 |
| 터미널 검증 | `node --check`, `npx prisma validate`, `npm run prisma:generate`, `git diff --check`, API smoke test 실행 결과 확인 |
| Git 변경 파일 확인 | `git status`, diff, commit, PR 변경 파일을 확인하고 예상 범위 밖 파일이 포함되지 않도록 검토 |
| 민감정보 확인 | `.env`, 실제 DB 연결 문자열, `JWT_SECRET`, Vercel 환경변수가 문서와 커밋에 포함되지 않도록 확인 |
| AI 결과 검토 | AI가 제안한 변경을 그대로 신뢰하지 않고 기능 단위로 동작, 검증 결과, 브라우저 화면을 확인한 뒤 반영 |

## 5. AI 활용 시 주의한 점

| 주의 항목 | 처리 내용 |
|---|---|
| `.env` 파일 미공개 | `.env` 파일은 문서에 작성하지 않고 커밋 대상에서 제외 |
| DB 연결 문자열 비공개 | `DATABASE_URL`, `DIRECT_URL`의 실제 값은 문서, 대화, 커밋에 작성하지 않음 |
| JWT secret 비공개 | `JWT_SECRET` 실제 값은 문서와 커밋에 포함하지 않음 |
| Vercel 환경변수 비공개 | Vercel에 등록된 운영 환경변수는 레포 파일과 문서에 작성하지 않음 |
| 실제 사용자 개인정보 미사용 | seed 데이터에는 테스트용 아이디와 커뮤니티형 닉네임만 사용 |
| destructive seed 주의 | `npm run db:seed:dev -- --confirm`은 현재 연결 DB 데이터를 삭제하므로 사용자가 의도한 작업에서만 실행 |
| PR #15 회귀 방지 | `createStatePanel`, `state-panel` 재귀 구조와 Loading/Empty/Error 전체 상태 UI 재도입을 피함 |
| 기능 단위 작업 | Issue/PR 단위로 작업을 분리하고 `Closes #이슈번호`, Related PR을 명시하여 변경 추적성을 유지 |
| 검증 후 반영 | 검증 명령, 변경 파일, 민감정보 노출 여부, 브라우저 확인 항목을 함께 점검한 뒤 merge |
| 문서와 캡처 분리 | 문서 내용 최신화와 스크린샷/GIF 최종 갱신을 분리하여 오래된 이미지 경로를 임의로 바꾸지 않음 |
