# DatabaseLanguage_NodeJS_CWNU-Community

대학교 데이터베이스 과제용 Node.js 웹 게시판 프로젝트입니다.

이 프로젝트는 기존 CWNU Smart Portal의 확장 서비스라는 컨셉을 가진 학내 커뮤니티 게시판입니다. 다만 기존 포털 레포와는 분리된 독립 DB 과제 레포로 구현합니다.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- bcrypt
- JWT stored in an httpOnly cookie
- HTML/CSS/Vanilla JS
- REST API with `fetch()`

EJS는 사용하지 않습니다.

## Setup

```bash
npm install
```

`.env.example`을 참고해 `.env` 파일을 생성하고 값을 설정합니다.

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
NODE_ENV="development"
PORT=3000
COOKIE_SECURE=false
```

Prisma Client를 생성합니다.

```bash
npm run prisma:generate
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```txt
http://localhost:3000
```

Health check:

```txt
GET http://localhost:3000/api/health
```

## Current Scope

현재 단계는 실행 가능한 기본 프로젝트 구조 생성입니다.

포함된 내용:

- Express 앱 기본 설정
- 정적 파일 제공
- JSON body parsing
- cookie parsing
- `GET /api/health`
- 라우트 파일 기본 연결
- Prisma Client 연결 파일
- Prisma schema 모델 초안
- 기본 HTML 화면 틀

아직 구현하지 않은 내용:

- 회원가입
- 로그인
- 로그아웃
- 게시글 CRUD
- 댓글 작성/삭제
- 좋아요/좋아요 취소

## Project Structure

```txt
DatabaseLanguage_NodeJS_CWNU-Community/
├─ api/
│  └─ index.js
├─ server/
│  ├─ app.js
│  ├─ prisma.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ post.routes.js
│  │  ├─ comment.routes.js
│  │  └─ like.routes.js
│  ├─ controllers/
│  ├─ middlewares/
│  │  └─ auth.middleware.js
│  └─ utils/
├─ prisma/
│  └─ schema.prisma
├─ public/
│  ├─ index.html
│  ├─ login.html
│  ├─ register.html
│  ├─ post-detail.html
│  ├─ post-write.html
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     ├─ api.js
│     ├─ auth.js
│     └─ posts.js
├─ docs/
├─ server.js
├─ package.json
├─ .env.example
└─ README.md
```
