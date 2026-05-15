# 데이터베이스개론 과제: CWNU Community 게시판 시스템

![Version](https://img.shields.io/badge/Version-v1.0.0-155bb5)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![DBMS](https://img.shields.io/badge/DBMS-PostgreSQL-4169E1)
![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FVanilla%20JS-f7df1e)

| 구분 | 내용 |
|---|---|
| GitHub 저장소 | [DatabaseLanguage_NodeJS_CWNU-Community](https://github.com/jeongiryang/DatabaseLanguage_NodeJS_CWNU-Community.git) |
| Vercel 배포 링크 | 배포 완료 후 추가 예정 |
| 연계 포털 GitHub | [CWNU Smart Portal](https://github.com/jeongiryang/todo-app-mini-project-20222017.git) |
| 연계 포털 배포 사이트 | [CWNU Smart Portal 바로가기](https://todo-app-mini-project-20222017.vercel.app/) |
| 기능 설명서 | `docs/feature-guide.md` 작성 예정 |
| AI 활용 명시 | `docs/ai-usage.md` 작성 예정 |
| 스크린샷 원본 | [docs/screenshots/raw](docs/screenshots/raw) |
| 대표 스크린샷 | [docs/screenshots/final](docs/screenshots/final) |
| Version | `v1.0.0` |

## 기획

`CWNU Community`는 국립창원대학교 구성원을 위한 학내 커뮤니티 게시판 시스템입니다.

이 프로젝트는 기존 소프트웨어공학 개인과제인 `CWNU Smart Portal`의 확장 서비스로 기획했습니다. 기존 Smart Portal이 학사 서비스와 주요 기능으로 이동하는 포털/입구 역할을 맡는다면, CWNU Community는 사용자가 실제로 글을 작성하고 댓글과 반응을 남길 수 있는 **DBMS 기반 커뮤니티 게시판** 역할을 담당합니다.

두 프로젝트는 역할이 다르기 때문에 레포지토리와 배포 프로젝트를 분리했습니다. 기존 포털에서는 커뮤니티, 중고마켓, 분실물센터 버튼을 통해 이 프로젝트의 특정 URL로 이동하고, 이 프로젝트는 데이터베이스개론 과제 조건에 맞는 독립적인 **Node.js 웹 게시판**으로 제출할 수 있도록 구성했습니다.

핵심 구현 방향은 다음과 같습니다.

- `CWNU Smart Portal`과 링크로 연결 가능한 독립 커뮤니티 서비스
- **Node.js + Express** 기반 REST API 서버
- **PostgreSQL** DBMS와 **Prisma ORM**을 활용한 데이터 모델링
- EJS 없이 **HTML/CSS/Vanilla JS**로 구성한 정적 프론트엔드
- `fetch()` 기반 API 통신
- **JWT httpOnly cookie** 기반 인증
- Vercel 배포를 고려한 `api/index.js` 서버리스 진입점과 `vercel.json` 라우팅 구조

---

## 미리보기

아래는 CWNU Community와 연계 포털의 주요 화면을 정리하기 위한 미리보기 영역입니다. 대표 이미지는 최종 제출 전 `docs/screenshots/final/` 경로에 배치합니다.

### 미리보기 - CWNU Community

| ![메인 게시판](docs/screenshots/final/main-board.png) |
|:--:|
| **▲ 메인 게시판: 전체글, 인기글, 공지사항, 카테고리 바로가기** |

| ![공지사항](docs/screenshots/final/notice-board.png) | ![인기글](docs/screenshots/final/hot-board.png) |
|:--:|:--:|
| **▲ 공지사항 게시판** | **▲ 인기글 게시판** |

| ![게시글 상세](docs/screenshots/final/post-detail.png) | ![댓글 답글](docs/screenshots/final/comment-replies.png) |
|:--:|:--:|
| **▲ 게시글 상세 화면** | **▲ 댓글과 1단계 답글** |

| ![마이페이지](docs/screenshots/final/mypage.png) | ![다크모드](docs/screenshots/final/dark-mode.png) |
|:--:|:--:|
| **▲ 마이페이지** | **▲ 다크모드 화면** |

| ![도움말 투어](docs/screenshots/final/help-tour.png) |
|:--:|
| **▲ 메인 페이지 사용 가이드 투어** |

### 미리보기 - CWNU Smart Portal 연계

| ![CWNU Smart Portal 메인](docs/screenshots/final/smart-portal-main.png) |
|:--:|
| **▲ 연계 대상 포털: CWNU Smart Portal 메인** |

| ![Smart Portal 커뮤니티 연결](docs/screenshots/final/smart-portal-community-link.png) |
|:--:|
| **▲ 포털에서 CWNU Community로 이동** |

| ![Smart Portal 중고마켓 연결](docs/screenshots/final/smart-portal-market-link.png) | ![Smart Portal 분실물 연결](docs/screenshots/final/smart-portal-lost-link.png) |
|:--:|:--:|
| **▲ 중고마켓 버튼에서 중고장터로 이동** | **▲ 분실물센터 버튼에서 분실물 게시판으로 이동** |

---

## 목차

- [I. 서론](#i-서론)
  - [1. 개요](#1-개요)
  - [2. 프로젝트 목적과 방향성](#2-프로젝트-목적과-방향성)
  - [3. 과제 요구 조건 체크리스트](#3-과제-요구-조건-체크리스트)
  - [4. 주요 파일 및 폴더 구조](#4-주요-파일-및-폴더-구조)
- [II. 본론](#ii-본론)
  - [1. 개발 환경](#1-개발-환경)
  - [2. 시스템 구조](#2-시스템-구조)
  - [3. DB 설계](#3-db-설계)
  - [4. 주요 기능](#4-주요-기능)
  - [5. Smart Portal 연계 구조](#5-smart-portal-연계-구조)
  - [6. 주요 API 요약](#6-주요-api-요약)
  - [7. 테스트 데이터 및 검증](#7-테스트-데이터-및-검증)
- [III. 문제 해결](#iii-문제-해결)
  - [1. 문제 요약 테이블](#1-문제-요약-테이블)
  - [2. Vercel API 라우팅](#2-vercel-api-라우팅)
  - [3. Prisma/Neon migration](#3-prismaneon-migration)
  - [4. JWT cookie 배포 환경](#4-jwt-cookie-배포-환경)
  - [5. Cascade 삭제 검증](#5-cascade-삭제-검증)
  - [6. Git/migration/민감정보 관리](#6-gitmigration민감정보-관리)
- [IV. 결론](#iv-결론)
  - [1. 배운 점](#1-배운-점)
  - [2. 느낀 점](#2-느낀-점)
  - [3. 아쉬운 점 및 향후 계획](#3-아쉬운-점-및-향후-계획)
- [부록](#부록)
  - [1. 프로젝트 개발 변천사](#1-프로젝트-개발-변천사)
  - [2. AI 활용 명시](#2-ai-활용-명시)

---

## I. 서론

### 1. 개요

| 항목 | 내용 |
|---|---|
| 이름 | 정이량 |
| 학번 | 20222017 |
| 과목명 | 데이터베이스개론 |
| 교수명 | 최도진 |
| 프로젝트명 | CWNU Community 게시판 시스템 |
| 개발 형태 | Node.js 기반 DBMS 웹 게시판 |
| DBMS | PostgreSQL |
| ORM | Prisma ORM |
| 배포 고려 환경 | Vercel |

`CWNU Community`는 학내 구성원이 게시글을 작성하고, 댓글과 반응 기능을 통해 소통할 수 있는 커뮤니티 게시판입니다. 전체글, 인기글, 공지사항, 자유게시판, 공부이야기, 질문게시판, 정보공유, 중고장터, 분실물 게시판을 제공하며, 기존 `CWNU Smart Portal`에서 필요한 메뉴로 바로 연결할 수 있도록 URL query 구조를 설계했습니다.

### 2. 프로젝트 목적과 방향성

본 프로젝트의 목적은 데이터베이스개론 과제 조건에 맞게 **DBMS를 활용한 실제 웹 게시판**을 구현하는 것입니다. 단순히 화면만 구성하는 것이 아니라 사용자, 게시글, 댓글, 답글, 좋아요, 싫어요, 북마크 데이터를 **PostgreSQL**에 저장하고, **Prisma ORM**으로 관계와 제약 조건을 관리했습니다.

개발 방향은 다음과 같습니다.

- 과제 필수 기능을 우선 구현
- 게시글 삭제와 회원 탈퇴 시 관련 데이터가 남지 않도록 **Cascade 삭제** 설계
- 작성자 본인만 수정/삭제할 수 있도록 서버에서 권한 검증
- 제출용 기능 설명서 캡처가 가능하도록 화면 흐름을 명확히 구성
- 기존 `CWNU Smart Portal`과 레포를 합치지 않고 독립 배포 후 링크로 연동

### 3. 과제 요구 조건 체크리스트

필수 요구사항과 추가 구현 기능이 섞이지 않도록, 아래 표는 과제 필수 조건 중심으로 정리했습니다.

| 필수 요구 조건 | 충족 여부 | 구현 내용 |
|---|---:|---|
| Node.js 사용 | 충족 | Node.js + Express 서버 |
| EJS 미사용 | 충족 | HTML/CSS/Vanilla JS 정적 프론트 |
| DBMS 활용 | 충족 | PostgreSQL 사용 |
| ORM 또는 Promise 기반 쿼리 | 충족 | Prisma ORM 사용 |
| 회원가입/로그인/로그아웃 | 충족 | `/api/auth` API |
| 비밀번호 암호화 | 충족 | bcrypt hash 저장 |
| 쿠키 방식 로그인 유지 | 충족 | JWT httpOnly cookie |
| 전체 글 조회 | 충족 | `GET /api/posts` |
| 10/20/30/40/50 페이징 | 충족 | `pageSize` 허용값 검증 |
| 목록에서 제목/게시자/등록일/댓글 수/좋아요 수 표시 | 충족 | 게시글 목록 테이블에 표시 |
| 좋아요순 또는 조회수순 정렬 | 충족 | `sort=likes`, `sort=views` |
| 게시글 상세 조회 | 충족 | `GET /api/posts/:id` |
| 게시글 내용 및 댓글 조회 | 충족 | 상세 화면과 댓글 API |
| 게시글 작성 | 충족 | 로그인 사용자만 작성 가능 |
| 게시글 삭제 | 충족 | 작성자 본인만 삭제 가능 |
| 게시글 삭제 시 댓글/좋아요 삭제 | 충족 | Prisma cascade 삭제 |
| 댓글 작성/삭제 | 충족 | 로그인 사용자 작성, 작성자 본인 삭제 |
| 좋아요/좋아요 취소 | 충족 | Like 모델과 API |
| 기능 설명서용 화면 구성 | 충족 | 주요 기능별 화면 구성 |

기본 댓글 작성/삭제는 필수 기능으로 구현했고, 1단계 답글은 추가 구현 기능으로 확장했습니다. 답글의 답글은 서버에서 제한하여 댓글 구조가 과도하게 깊어지지 않도록 처리했습니다.

### 4. 주요 파일 및 폴더 구조

```txt
DatabaseLanguage_NodeJS_CWNU-Community/
|- api/
|  `- index.js
|- docs/
|  `- screenshots/
|- prisma/
|  |- migrations/
|  `- schema.prisma
|- public/
|  |- css/
|  |  `- style.css
|  |- js/
|  |  |- api.js
|  |  |- auth.js
|  |  |- mypage.js
|  |  `- posts.js
|  |- index.html
|  |- login.html
|  |- register.html
|  |- post-detail.html
|  |- post-write.html
|  `- mypage.html
|- scripts/
|  `- seed-dev.js
|- server/
|  |- app.js
|  |- prisma.js
|  |- controllers/
|  |- middlewares/
|  |- routes/
|  `- utils/
|- .env.example
|- AGENTS.md
|- package.json
|- README.md
|- server.js
`- vercel.json
```

---

## II. 본론

### 1. 개발 환경

| 구분 | 사용 기술 |
|---|---|
| Runtime | Node.js |
| Server | Express.js |
| DBMS | PostgreSQL |
| ORM | Prisma ORM |
| 인증 | JWT + httpOnly cookie |
| 비밀번호 암호화 | bcrypt |
| Frontend | HTML, CSS, Vanilla JavaScript |
| API 호출 | `fetch()` |
| 배포 고려 | Vercel |

서버 사이드 템플릿 엔진은 사용하지 않았습니다. 화면은 `public/` 디렉터리의 정적 HTML, CSS, Vanilla JS로 구성하고, 데이터는 REST API를 `fetch()`로 호출하여 처리했습니다.

### 2. 시스템 구조

```txt
Browser
  |
  | HTML/CSS/Vanilla JS
  | fetch()
  v
Express REST API
  |
  | Prisma Client
  v
PostgreSQL
```

로컬 환경에서는 `server.js`가 Express 앱을 실행합니다. Vercel 배포 환경에서는 `api/index.js`가 서버리스 Express 진입점 역할을 하고, `vercel.json`의 rewrite 설정으로 `/api` 요청을 Express 앱에 전달합니다.

### 3. DB 설계

본 프로젝트는 관계형 데이터베이스의 특성을 살리기 위해 사용자, 게시글, 댓글, 반응 데이터를 명확한 관계로 분리했습니다. 중복 반응을 막기 위한 unique 제약과 삭제 시 데이터가 남지 않도록 하는 cascade 정책을 함께 고려했습니다.

| 모델 | 역할 | 주요 필드 | 관계 및 제약 |
|---|---|---|---|
| User | 사용자 계정 | `email`, `nickname`, `passwordHash` | Post, Comment, Like, Dislike, Bookmark와 1:N |
| Post | 게시글 | `title`, `content`, `category`, `isAnonymous`, `viewCount` | User에 속함, Comment/Like/Dislike/Bookmark 보유 |
| Comment | 댓글/답글 | `content`, `parentId`, `isAnonymous` | Post/User에 속함, `parentId`로 1단계 답글 관리 |
| Like | 좋아요 | `postId`, `userId` | `postId + userId` unique |
| Dislike | 싫어요 | `postId`, `userId` | `postId + userId` unique |
| Bookmark | 북마크 | `postId`, `userId` | `postId + userId` unique |

#### 삭제 및 반응 처리 정책

| 삭제 상황 | 처리 |
|---|---|
| 게시글 삭제 | 댓글, 답글, 좋아요, 싫어요, 북마크 cascade 삭제 |
| 회원 탈퇴 | 작성 게시글, 댓글/답글, 좋아요, 싫어요, 북마크 삭제 |
| 부모 댓글 삭제 | 연결된 답글 삭제 |
| 좋아요/싫어요 전환 | 반대 반응 삭제 후 현재 반응 생성 |

### 4. 주요 기능

필수 구현 기능은 과제 요구사항을 기준으로 정리했고, 추가 구현 기능은 실제 커뮤니티 서비스에 가까운 사용성을 제공하기 위해 확장한 항목입니다.

#### 4-1. 필수 구현 기능

| 영역 | 기능 | 구현 내용 |
|---|---|---|
| 인증 | 회원가입/로그인/로그아웃 | JWT httpOnly cookie 기반 인증 |
| 보안 | 비밀번호 암호화 | bcrypt hash 저장 |
| 게시글 | 목록/상세/작성/삭제 | Prisma 기반 CRUD, 작성자 삭제 권한 검증 |
| 댓글 | 댓글 작성/삭제 | 로그인 사용자 작성, 작성자 본인 삭제 |
| 좋아요 | 좋아요/취소 | Like 모델, `postId + userId` unique로 중복 방지 |
| 목록 | 페이징/정렬 | 10~50개 단위, 좋아요순/조회수순 지원 |
| DB | DBMS/ORM | PostgreSQL + Prisma ORM |

#### 4-2. 추가 구현 기능

| 영역 | 기능 | 설명 |
|---|---|---|
| 사용자 | 닉네임 변경/회원 탈퇴 | 마이페이지에서 계정 관리, 탈퇴 시 관련 데이터 정리 |
| 게시글 | 수정/익명/공유 | 수정일 표시, 익명 작성, 상세 링크 복사 |
| 게시판 | 공지사항/인기글/카테고리 | Smart Portal 연계 URL 지원 |
| 댓글 | 답글/수정/익명 | 1단계 답글, 답글의 답글 제한, 익명 댓글/답글 |
| 반응 | 싫어요/북마크 | 좋아요와 싫어요 상호 전환, 게시글 저장 |
| UX | 다크모드/도움말/hover/footer | 사용자 편의성과 제출 문서 완성도 강화 |
| 데이터 | seed-dev | 테스트용 사용자, 게시글, 댓글, 반응 데이터 자동 생성 |

#### 게시판 URL 구조

```txt
/                   전체글
/?board=hot         인기글
/?board=notice      공지사항
/?category=free     자유게시판
/?category=study    공부이야기
/?category=question 질문게시판
/?category=info     정보공유
/?category=market   중고장터
/?category=lost     분실물
```

인기글은 기존 데이터만 사용하여 다음 점수 기준으로 정렬합니다.

```txt
hotScore = viewCount + likeCount * 10 + commentCount * 5 - dislikeCount * 3
```

### 5. Smart Portal 연계 구조

본 프로젝트는 기존 `CWNU Smart Portal`의 확장 서비스로 설계했습니다. 기존 포털에서는 버튼 링크를 통해 본 게시판의 특정 URL로 이동할 수 있습니다.

| CWNU Smart Portal 메뉴 | 연결 URL |
|---|---|
| 커뮤니티 바로가기 | `/` |
| 중고 마켓 | `/?category=market` |
| 분실물 센터 | `/?category=lost` |
| 공지사항 | `/?board=notice` |
| 인기글 | `/?board=hot` |

두 프로젝트는 하나의 레포로 합치지 않습니다. `CWNU Smart Portal`은 기존 포털 프로젝트로 유지하고, `CWNU Community`는 데이터베이스개론 과제용 독립 레포와 독립 배포 프로젝트로 운영한 뒤 URL 링크로 연결합니다.

### 6. 주요 API 요약

대표 API 중심 요약입니다. 전체 API 구성은 `server/routes/` 디렉터리에서 확인할 수 있습니다.

| 영역 | Method | Endpoint | 설명 |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | 회원가입 |
| Auth | POST | `/api/auth/login` | 로그인 |
| Auth | POST | `/api/auth/logout` | 로그아웃 |
| Auth | GET | `/api/auth/me` | 현재 사용자 조회 |
| Auth | PATCH | `/api/auth/me` | 닉네임 변경 |
| Auth | DELETE | `/api/auth/me` | 회원 탈퇴 |
| Auth | GET | `/api/auth/me/activity` | 마이페이지 활동 조회 |
| Posts | GET | `/api/posts` | 게시글 목록, 검색, 정렬, 페이징 |
| Posts | GET | `/api/posts/:id` | 게시글 상세 조회 |
| Posts | POST | `/api/posts` | 게시글 작성 |
| Posts | PUT | `/api/posts/:id` | 게시글 수정 |
| Posts | DELETE | `/api/posts/:id` | 게시글 삭제 |
| Comments | GET | `/api/posts/:postId/comments` | 댓글/답글 조회 |
| Comments | POST | `/api/posts/:postId/comments` | 댓글/답글 작성 |
| Comments | PUT | `/api/comments/:id` | 댓글/답글 수정 |
| Comments | DELETE | `/api/comments/:id` | 댓글/답글 삭제 |
| 반응 | POST | `/api/posts/:postId/like` | 좋아요 |
| 반응 | DELETE | `/api/posts/:postId/like` | 좋아요 취소 |
| 반응 | POST | `/api/posts/:postId/dislike` | 싫어요 |
| 반응 | DELETE | `/api/posts/:postId/dislike` | 싫어요 취소 |
| 반응 | POST | `/api/posts/:postId/bookmark` | 북마크 |
| 반응 | DELETE | `/api/posts/:postId/bookmark` | 북마크 취소 |

### 7. 테스트 데이터 및 검증

#### 로컬 실행 순서

1. 의존성 설치

```bash
npm install
```

2. `.env.example`을 참고하여 `.env` 생성

```txt
DATABASE_URL
DIRECT_URL
JWT_SECRET
NODE_ENV
PORT
COOKIE_SECURE
```

3. Prisma Client 생성

```bash
npm run prisma:generate
```

4. 개발 DB migration 적용

```bash
npx prisma migrate dev
```

5. 개발용 seed 데이터 생성

```bash
npm run db:seed:dev -- --confirm
```

6. 개발 서버 실행

```bash
npm run dev
```

7. 브라우저 접속

```txt
http://localhost:3000
```

#### seed 스크립트 안전장치

| 안전장치 | 내용 |
|---|---|
| production 차단 | `NODE_ENV=production`이면 실행 중단 |
| confirm 요구 | `--confirm` 인자가 없으면 실행 중단 |
| 데이터 초기화 | 기존 데이터를 삭제한 뒤 더미 데이터 생성 |
| 민감정보 보호 | DB URL, JWT secret 등 민감 환경변수 값 미출력 |

#### 테스트 계정

seed 실행 후 사용할 수 있는 테스트 계정입니다. 모든 계정의 비밀번호는 `test1234!`입니다.

| 이메일 | 닉네임 |
|---|---|
| `algo@cwnu.ac.kr` | 알고리즘장인 |
| `campuscat@cwnu.ac.kr` | 캠퍼스고양이 |
| `assignment@cwnu.ac.kr` | 과제폭격기 |
| `dbmaster@cwnu.ac.kr` | DB마스터 |
| `potato@cwnu.ac.kr` | 코딩하는감자 |
| `dawnlib@cwnu.ac.kr` | 새벽도서관 |
| `hello543@cwnu.ac.kr` | hello543 |
| `king@cwnu.ac.kr` | 킹왕짱 |

#### 기본 검증 명령

```bash
npx prisma validate
node --check public/js/auth.js
node --check public/js/posts.js
node --check public/js/mypage.js
```

Health check:

```txt
GET http://localhost:3000/api/health
```

---

## III. 문제 해결

### 1. 문제 요약 테이블

| 문제 | 원인 | 해결 |
|---|---|---|
| Vercel에서 하위 API 경로 라우팅 필요 | Express 앱을 서버리스 함수로 실행해야 함 | `vercel.json`에서 `/api`와 `/api/*`를 `api/index.js`로 rewrite |
| Prisma와 Neon 연결 URL 분리 | pooled connection과 direct connection 용도가 다름 | `DATABASE_URL`, `DIRECT_URL`을 분리하여 사용 |
| 배포 환경에서 인증 쿠키 저장 문제 | HTTPS 환경에서는 secure cookie 설정 필요 | `NODE_ENV=production`, `COOKIE_SECURE=true` 사용 |
| 게시글 삭제 시 관련 데이터 잔존 가능성 | 댓글, 답글, 반응, 북마크가 관계로 연결됨 | Prisma relation에 cascade 삭제 적용 |
| 회원 탈퇴 시 사용자 활동 데이터 정리 필요 | 사용자가 작성/반응한 데이터가 여러 테이블에 분산됨 | transaction과 cascade 삭제를 함께 사용 |
| 좋아요와 싫어요 동시 적용 가능성 | Like와 Dislike가 별도 테이블 | 반대 반응 삭제 후 현재 반응 생성 |
| 답글의 답글 생성 가능성 | Comment self relation만으로는 깊이 제한이 부족함 | parent 댓글의 `parentId`를 검사해 1단계까지만 허용 |
| 민감정보 노출 위험 | `.env` 또는 콘솔 출력 관리 필요 | `.env` 미커밋, `.env.example` 제공, seed 출력 제한 |
| Windows 환경 Prisma 파일 잠금 | 실행 중인 Node 프로세스가 Prisma Client 파일을 잡을 수 있음 | 서버 종료 후 generate/migrate 실행, 필요 시 Node 프로세스 정리 |

아래 하위 섹션에서는 배포, migration, 인증 cookie, 삭제 정책처럼 실제 구현 과정에서 중요했던 기술적 판단을 정리했습니다.

### 2. Vercel API 라우팅

Vercel 서버리스 Express 진입점은 다음 파일입니다.

```txt
api/index.js
```

`vercel.json`은 `/api`와 `/api/*` 요청을 Express 앱으로 전달합니다.

```json
{
  "rewrites": [
    {
      "source": "/api",
      "destination": "/api/index.js"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

정적 HTML/CSS/JS 파일은 `public/` 디렉터리를 통해 제공됩니다.

#### Vercel 배포 환경변수

Vercel Project Settings의 Environment Variables에 아래 변수명을 등록합니다. 실제 값은 README나 제출 문서에 작성하지 않습니다.

| 변수 | 설정 |
|---|---|
| `DATABASE_URL` | Prisma Client용 PostgreSQL 연결 URL |
| `DIRECT_URL` | Prisma migration용 직접 연결 URL |
| `JWT_SECRET` | JWT 서명용 비밀키 |
| `NODE_ENV` | `production` |
| `COOKIE_SECURE` | `true` |

#### Vercel 배포 절차

| 단계 | 내용 |
|---|---|
| 1 | Vercel에 GitHub 저장소 연결 |
| 2 | Vercel 환경변수 등록 |
| 3 | PostgreSQL DB 준비 |
| 4 | `npx prisma migrate deploy`로 migration 적용 |
| 5 | Vercel 배포 실행 |
| 6 | 배포 후 `/api/health` 확인 |
| 7 | 회원가입/로그인 cookie 동작 확인 |

Prisma Client는 `package.json`의 `postinstall` 스크립트로 생성됩니다.

```json
"postinstall": "prisma generate"
```

### 3. Prisma/Neon migration

Neon PostgreSQL 환경에서는 애플리케이션이 사용하는 연결 URL과 migration에 사용하는 직접 연결 URL을 분리하는 것이 안정적입니다.

```txt
DATABASE_URL
DIRECT_URL
```

| 환경 | 명령 | 목적 |
|---|---|---|
| 개발 | `npx prisma migrate dev` | migration 생성 및 개발 DB 적용 |
| 배포 | `npx prisma migrate deploy` | 생성된 migration을 운영 DB에 적용 |
| 공통 | `npm run prisma:generate` | Prisma Client 생성 |

### 4. JWT cookie 배포 환경

인증 토큰은 localStorage나 sessionStorage에 저장하지 않고 **httpOnly cookie**에만 저장합니다. 배포 환경에서는 HTTPS를 기준으로 secure cookie를 사용합니다.

```txt
NODE_ENV=production
COOKIE_SECURE=true
```

이 방식은 브라우저 JavaScript에서 토큰을 직접 읽을 수 없도록 하여 토큰 노출 위험을 줄입니다.

### 5. Cascade 삭제 검증

게시글 삭제 시 함께 삭제되어야 하는 데이터는 다음과 같습니다.

- 댓글
- 답글
- 좋아요
- 싫어요
- 북마크

회원 탈퇴 시 정리되어야 하는 데이터는 다음과 같습니다.

- 탈퇴 사용자가 작성한 게시글
- 탈퇴 사용자가 작성한 댓글/답글
- 탈퇴 사용자가 누른 좋아요
- 탈퇴 사용자가 누른 싫어요
- 탈퇴 사용자가 저장한 북마크
- 사용자 계정

서버에서는 프론트에서 전달한 userId를 신뢰하지 않고, 인증 미들웨어에서 확인한 현재 로그인 사용자 기준으로 처리합니다.

### 6. Git/migration/민감정보 관리

- `.env`는 커밋하지 않습니다.
- `.env.example`만 제공합니다.
- migration 파일은 커밋 대상입니다.
- 실제 DB URL과 JWT secret은 README, 캡처, 제출 문서에 작성하지 않습니다.
- seed 스크립트는 production 환경에서 실행되지 않도록 차단합니다.
- 기능 단위로 커밋하여 migration과 코드 변경 이력을 추적할 수 있게 관리합니다.

---

## IV. 결론

### 1. 배운 점

이번 프로젝트를 통해 **RDBMS 관계 설계**가 단순 CRUD보다 훨씬 중요하다는 점을 배웠습니다. 게시글, 댓글, 답글, 좋아요, 싫어요, 북마크처럼 서로 연결된 데이터는 테이블 구조뿐 아니라 unique 제약, cascade 삭제, 서버 권한 검증을 함께 고려해야 안정적으로 동작했습니다.

또한 **Prisma migration**을 사용하면서 개발 DB와 배포 DB의 schema를 일관되게 관리하는 방법을 익혔습니다. **Vercel 배포 환경**을 고려하면서 서버리스 API 라우팅, Prisma Client 생성, **httpOnly cookie 인증**의 secure 옵션도 함께 학습했습니다.

Git 브랜치와 커밋 관리 측면에서는 기능이 많아질수록 작은 단위의 변경 기록과 회귀 점검이 중요하다는 점을 확인했습니다.

### 2. 느낀 점

초기에는 회원가입, 로그인, 게시글 작성 정도의 필수 기능이 중심이었지만, 기능이 늘어날수록 데이터 관계와 검증 로직의 중요성이 커졌습니다. 특히 회원 탈퇴, 게시글 삭제, 좋아요/싫어요 상호 전환처럼 여러 테이블이 동시에 영향을 받는 기능은 화면보다 서버 로직이 더 중요했습니다.

다크모드, 도움말 투어, 마이페이지, footer처럼 사용자 경험을 개선하는 기능을 추가하면서 과제 제출용 프로젝트도 실제 서비스처럼 정리할 수 있다는 점을 느꼈습니다. 기능이 많아질수록 회귀 테스트와 문서화가 중요했고, AI 도구를 활용하더라도 최종 동작 확인과 문서 검토는 사람이 책임져야 한다는 점도 확인했습니다.

### 3. 아쉬운 점 및 향후 계획

향후 개선할 수 있는 부분은 다음과 같습니다.

- 이미지 업로드 기능
- 신고 및 관리자 기능
- 알림 기능
- 게시글 검색 조건 세분화
- 실제 Vercel 배포 URL과 Smart Portal 버튼 연동
- 기능 설명서 고도화
- 모바일 화면 세부 UI 개선

---

## 부록

### 1. 프로젝트 개발 변천사

| 단계 | 주요 내용 |
|---|---|
| 1단계 | Node.js + Express 기본 구조 생성 |
| 2단계 | PostgreSQL + Prisma schema/migration 준비 |
| 3단계 | 회원가입, 로그인, 로그아웃 구현 |
| 4단계 | 게시글 목록, 상세, 작성, 삭제 구현 |
| 5단계 | 댓글 작성/조회/삭제 구현 |
| 6단계 | 좋아요/좋아요 취소 구현 |
| 7단계 | 게시글 수정, 수정일 표시 구현 |
| 8단계 | 회원 탈퇴 구현 |
| 9단계 | 싫어요, 조회수, 검색, 카테고리 구현 |
| 10단계 | 개발용 seed 데이터, 마이페이지, 공유 기능 추가 |
| 11단계 | UI/UX 개선, 공지사항, 인기글, 다크모드 추가 |
| 12단계 | 북마크, 익명 작성, 댓글 답글, 댓글 수정 구현 |
| 13단계 | footer, 도움말 투어, Vercel 배포 설정 정리 |
| 14단계 | README를 최종 제출용 보고서형 문서로 재구성 |

### 2. AI 활용 명시

본 프로젝트 구현 및 문서 정리 과정에서 OpenAI Codex 및 ChatGPT를 활용했습니다.

| 항목 | 내용 |
|---|---|
| 사용 도구 | OpenAI Codex, ChatGPT |
| 활용 범위 | 구현 전략 수립, 코드 작성 보조, UI/UX 개선, 오류 분석, README 작성 보조, 테스트 체크리스트 작성 |
| 직접 검토한 내용 | 브라우저 테스트, Prisma Studio 확인, Git 커밋 관리, 민감정보 제거 |
| 최종 책임 | 제출자가 AI 결과물을 검토하고 수정하여 최종 제출물을 구성함 |

AI를 활용했지만, 최종 기능 동작과 제출 문서는 과제 요구사항에 맞게 직접 검토하여 정리했습니다.
