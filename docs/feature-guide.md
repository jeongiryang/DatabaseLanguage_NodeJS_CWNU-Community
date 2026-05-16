# CWNU Community 기능 설명서

데이터베이스개론 과제 제출용 기능 설명서입니다. 본 문서는 `DatabaseLanguage_NodeJS_CWNU-Community` 프로젝트의 페이지별 기능, 동작 방식, 관련 API/DB, 캡처 위치, 검증 내용을 정리합니다.

> 이 문서는 `docs/feature-guide.md`에 위치하므로, 이미지 경로는 `docs` 폴더 기준 상대경로인 `./screenshots/...` 형식으로 작성합니다.

## 1. 프로젝트 개요

### 기능 설명

`CWNU Community`는 국립창원대학교 구성원을 위한 학내 커뮤니티 게시판 시스템입니다. 기존 `CWNU Smart Portal`의 확장 서비스로 기획했지만, 데이터베이스개론 과제 제출을 위해 별도 레포지토리와 별도 배포 프로젝트로 구성했습니다.

### 동작 방식

- 사용자는 정적 HTML 화면에서 게시글, 댓글, 반응 기능을 사용합니다.
- 프론트엔드는 `fetch()`로 REST API를 호출합니다.
- 서버는 Express에서 요청을 처리하고 Prisma Client로 PostgreSQL에 접근합니다.
- 인증은 JWT를 httpOnly cookie에 저장하는 방식으로 유지합니다.

### 관련 API 또는 DB

| 구분 | 내용 |
|---|---|
| 서버 | Node.js + Express |
| DBMS | PostgreSQL |
| ORM | Prisma ORM |
| 인증 | JWT httpOnly cookie |
| 주요 DB 모델 | User, Post, Comment, Like, Dislike, Bookmark |

### 관련 화면

- `public/index.html`
- `public/login.html`
- `public/register.html`
- `public/post-detail.html`
- `public/post-write.html`
- `public/mypage.html`

### [캡처 삽입 위치]

```md
![메인 게시판](./screenshots/99-final/main-board.png)
```

### 검증 내용

- `/api/health`가 정상 응답하는지 확인합니다.
- 메인 페이지에서 게시글 목록이 표시되는지 확인합니다.
- 로그인/비로그인 상태에서 헤더 표시가 달라지는지 확인합니다.

---

## 2. 기술 스택

### 기능 설명

프로젝트는 Node.js 기반 서버와 정적 프론트엔드로 구성했습니다. EJS는 사용하지 않고 HTML/CSS/Vanilla JS와 REST API 호출 방식으로 구현했습니다.

### 동작 방식

| 영역 | 사용 기술 | 설명 |
|---|---|---|
| Runtime | Node.js | 서버 실행 환경 |
| Server | Express.js | REST API와 정적 파일 제공 |
| DBMS | PostgreSQL | 사용자, 게시글, 댓글, 반응 데이터 저장 |
| ORM | Prisma ORM | DB 모델과 query 관리 |
| Auth | JWT + httpOnly cookie | 로그인 유지 |
| Password | bcrypt | 비밀번호 hash 저장 |
| Frontend | HTML/CSS/Vanilla JS | EJS 없이 정적 화면 구성 |
| API | `fetch()` | 클라이언트에서 REST API 호출 |

### 관련 API 또는 DB

- `server/app.js`: Express 앱 설정
- `api/index.js`: Vercel 서버리스 진입점
- `server/prisma.js`: Prisma Client 연결
- `prisma/schema.prisma`: DB 모델 정의

### 관련 화면

- 전체 HTML 페이지
- 전체 JavaScript 파일

### [캡처 삽입 위치]

```md
![프로젝트 구조](./screenshots/99-final/project-structure.png)
```

### 검증 내용

- `npm install` 후 의존성이 설치되는지 확인합니다.
- `npm run prisma:generate`가 정상 실행되는지 확인합니다.
- `npm run dev`로 로컬 서버가 실행되는지 확인합니다.

---

## 3. DBMS/ORM 사용 설명

### 기능 설명

PostgreSQL을 DBMS로 사용하고 Prisma ORM을 통해 모델, relation, unique 제약, cascade 삭제 정책을 관리합니다.

### 동작 방식

- Prisma datasource는 `DATABASE_URL`과 `DIRECT_URL` 환경변수를 사용합니다.
- `DATABASE_URL`은 애플리케이션 query에 사용합니다.
- `DIRECT_URL`은 migration을 위한 직접 연결에 사용합니다.
- Prisma migration 파일은 `prisma/migrations/`에 보관합니다.

### 관련 API 또는 DB

| 모델 | 역할 | 주요 관계 |
|---|---|---|
| User | 사용자 계정 | Post, Comment, Like, Dislike, Bookmark와 1:N |
| Post | 게시글 | User에 속하고 Comment, Like, Dislike, Bookmark 보유 |
| Comment | 댓글/답글 | Post/User에 속하고 parentId로 1단계 답글 구성 |
| Like | 좋아요 | `postId + userId` unique |
| Dislike | 싫어요 | `postId + userId` unique |
| Bookmark | 북마크 | `postId + userId` unique |

### 관련 화면

- Prisma Studio 확인 화면
- 게시글 목록/상세 화면
- 마이페이지 활동 목록

### [캡처 삽입 위치]

```md
![Prisma Studio 모델 확인](./screenshots/06-database/prisma-studio-models.png)
```

### 검증 내용

- `npx prisma validate`로 schema 유효성을 확인합니다.
- `npx prisma migrate dev`로 개발 DB에 migration이 적용되는지 확인합니다.
- 게시글 삭제 시 연결된 댓글, 좋아요, 싫어요, 북마크가 남지 않는지 확인합니다.

---

## 4. 회원가입 / 로그인 / 로그아웃

### 기능 설명

사용자는 이메일, 닉네임, 비밀번호로 회원가입할 수 있고, 로그인 후 JWT httpOnly cookie로 인증 상태가 유지됩니다.

### 동작 방식

- 회원가입 시 이메일과 닉네임 중복을 검사합니다.
- 비밀번호는 bcrypt로 hash 처리하여 저장합니다.
- 로그인 성공 시 JWT를 httpOnly cookie에 저장합니다.
- 로그아웃 시 인증 cookie를 제거합니다.
- `/api/auth/me`로 현재 로그인 상태를 확인합니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 조회 |

| DB 모델 | 관련 필드 |
|---|---|
| User | `email`, `nickname`, `passwordHash`, `createdAt` |

### 관련 화면

- `public/register.html`
- `public/login.html`
- `public/index.html` 상단 사용자 영역

### [캡처 삽입 위치]

```md
![회원가입 화면](./screenshots/01-auth/register.png)
![로그인 화면](./screenshots/01-auth/login.png)
![로그인 후 헤더](./screenshots/01-auth/auth-header.png)
```

### 검증 내용

- 새 계정으로 회원가입이 되는지 확인합니다.
- 같은 이메일 또는 같은 닉네임으로 중복 가입이 거부되는지 확인합니다.
- 로그인 후 헤더에 사용자 닉네임이 표시되는지 확인합니다.
- 로그아웃 후 `/api/auth/me`가 비로그인 상태를 반환하는지 확인합니다.

---

## 5. 비밀번호 보기 / 닉네임 변경 / 회원 탈퇴

### 기능 설명

회원가입/로그인 화면에서는 비밀번호 보기/숨기기를 지원합니다. 로그인 사용자는 마이페이지에서 닉네임을 변경하거나 계정을 탈퇴할 수 있습니다.

### 동작 방식

- 비밀번호 보기 버튼은 input type을 `password`와 `text`로 전환합니다.
- 닉네임 변경은 로그인 사용자 본인의 `User.nickname`만 수정합니다.
- 닉네임은 trim 처리 후 2자 이상 20자 이하로 검증합니다.
- 회원 탈퇴 시 현재 로그인 사용자 기준으로 계정과 관련 데이터를 삭제하고 인증 cookie를 제거합니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| PATCH | `/api/auth/me` | 닉네임 변경 |
| DELETE | `/api/auth/me` | 회원 탈퇴 |
| GET | `/api/auth/me/activity` | 마이페이지 활동 조회 |

| DB 모델 | 관련 필드 |
|---|---|
| User | `nickname`, `email`, `createdAt` |
| Post/Comment/Like/Dislike/Bookmark | 회원 탈퇴 시 정리 대상 |

### 관련 화면

- `public/register.html`
- `public/login.html`
- `public/mypage.html`

### [캡처 삽입 위치]

```md
![비밀번호 보기 숨기기](./screenshots/01-auth/password-toggle.png)
![닉네임 변경](./screenshots/01-auth/update-nickname.png)
![회원 탈퇴 확인](./screenshots/01-auth/delete-account.png)
```

### 검증 내용

- 비밀번호 보기/숨기기 버튼이 정상 전환되는지 확인합니다.
- 닉네임 변경 후 헤더와 마이페이지에 변경된 닉네임이 표시되는지 확인합니다.
- 비로그인 상태에서 닉네임 변경 API 요청 시 401이 반환되는지 확인합니다.
- 회원 탈퇴 후 로그인 상태가 해제되고 사용자 데이터가 삭제되는지 확인합니다.

---

## 6. 게시글 목록 / 카테고리 / 공지사항 / 인기글

### 기능 설명

메인 페이지에서는 전체글, 인기글, 공지사항, 카테고리 게시판을 볼 수 있습니다. Smart Portal에서 특정 URL로 직접 이동할 수 있도록 query parameter 기반 진입을 지원합니다.

### 동작 방식

- 기본 `/` 요청은 전체글 목록을 보여줍니다.
- `/?board=hot`은 hotScore 기준 인기글을 보여줍니다.
- `/?board=notice`는 공지사항 카테고리 글을 보여줍니다.
- `/?category=market`, `/?category=lost` 등은 카테고리별 목록을 보여줍니다.
- 게시글 목록에는 제목, 카테고리, 작성자, 등록일, 수정일, 조회수, 댓글 수, 좋아요 수, 싫어요 수가 표시됩니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/posts` | 게시글 목록 조회 |

| Query | 설명 |
|---|---|
| `board=hot` | 인기글 |
| `board=notice` | 공지사항 |
| `category=free/study/question/info/market/lost` | 카테고리 게시판 |

| DB 모델 | 관련 필드 |
|---|---|
| Post | `category`, `viewCount`, `createdAt`, `updatedAt` |
| Comment/Like/Dislike | 목록 count 표시 |

### 관련 화면

- `public/index.html`

### [캡처 삽입 위치]

```md
![메인 게시판](./screenshots/05-pagination-sort/main-board.png)
![공지사항 게시판](./screenshots/05-pagination-sort/notice-board.png)
![인기글 게시판](./screenshots/05-pagination-sort/hot-board.png)
![중고장터 게시판](./screenshots/05-pagination-sort/market-board.png)
![분실물 게시판](./screenshots/05-pagination-sort/lost-board.png)
```

### 검증 내용

- `/`에서 전체글이 표시되는지 확인합니다.
- `/?board=hot`에서 인기글이 hotScore 기준으로 표시되는지 확인합니다.
- `/?board=notice`에서 공지사항 글만 표시되는지 확인합니다.
- `/?category=market`, `/?category=lost`가 Smart Portal 연계 URL로 사용 가능한지 확인합니다.

---

## 7. 검색 / 정렬 / 페이징

### 기능 설명

게시글 목록에서는 검색어, 정렬, 표시 개수, 페이지 이동을 지원합니다.

### 동작 방식

- 검색 대상은 게시글 제목, 내용, 작성자 닉네임입니다.
- 정렬은 최신순, 좋아요순, 조회수순, 댓글순을 지원합니다.
- 페이지 크기는 10/20/30/40/50개만 허용합니다.
- 검색, 정렬, 카테고리, 공지사항, 인기글 조건은 함께 동작합니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/posts?page=1&pageSize=10&sort=latest&q=검색어` | 게시글 검색/정렬/페이징 |

| Query | 설명 |
|---|---|
| `q` | 제목/내용/작성자 닉네임 검색 |
| `sort=latest` | 최신순 |
| `sort=likes` | 좋아요순 |
| `sort=views` | 조회수순 |
| `sort=comments` | 댓글순 |
| `pageSize=10/20/30/40/50` | 페이지 크기 |

### 관련 화면

- `public/index.html`

### [캡처 삽입 위치]

```md
![검색 기능](./screenshots/05-pagination-sort/search.png)
![최신순 정렬](./screenshots/05-pagination-sort/sort-latest.png)
![좋아요순 정렬](./screenshots/05-pagination-sort/sort-likes.png)
![조회수순 정렬](./screenshots/05-pagination-sort/sort-views.png)
![댓글순 정렬](./screenshots/05-pagination-sort/sort-comments.png)
![페이징 기능](./screenshots/05-pagination-sort/pagination.png)
```

### 검증 내용

- 제목, 내용, 작성자 닉네임 검색이 되는지 확인합니다.
- 검색 결과가 없을 때 안내 문구가 표시되는지 확인합니다.
- 좋아요순, 조회수순, 댓글순 정렬이 실제 count 기준으로 동작하는지 확인합니다.
- pageSize가 10/20/30/40/50 단위로 변경되는지 확인합니다.

---

## 8. 게시글 작성 / 상세 / 수정 / 삭제

### 기능 설명

로그인 사용자는 게시글을 작성할 수 있으며, 작성자 본인만 수정과 삭제를 할 수 있습니다.

### 동작 방식

- 글 작성 시 제목, 내용, 카테고리를 입력합니다.
- 익명 작성 체크 시 목록과 상세 화면의 작성자는 “익명”으로 표시됩니다.
- 상세 조회 시 조회수가 증가합니다.
- 작성자 본인에게만 수정/삭제 버튼이 표시됩니다.
- 서버에서도 현재 로그인 사용자와 게시글 작성자 userId를 비교하여 권한을 검증합니다.
- 게시글 삭제 시 댓글, 답글, 좋아요, 싫어요, 북마크도 함께 삭제됩니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/posts/:id` | 게시글 상세 |
| POST | `/api/posts` | 게시글 작성 |
| PUT | `/api/posts/:id` | 게시글 수정 |
| DELETE | `/api/posts/:id` | 게시글 삭제 |

| DB 모델 | 관련 필드 |
|---|---|
| Post | `title`, `content`, `category`, `isAnonymous`, `viewCount`, `userId`, `createdAt`, `updatedAt` |

### 관련 화면

- `public/post-write.html`
- `public/post-detail.html`
- `public/index.html`

### [캡처 삽입 위치]

```md
![게시글 작성](./screenshots/02-posts/post-write.png)
![게시글 상세](./screenshots/02-posts/post-detail.png)
![게시글 수정](./screenshots/02-posts/post-edit.png)
![게시글 삭제](./screenshots/02-posts/post-delete.png)
![익명 게시글](./screenshots/02-posts/anonymous-post.png)
```

### 검증 내용

- 비로그인 사용자는 글 작성 화면 접근이 제한되는지 확인합니다.
- 제목/내용 공백 입력이 거부되는지 확인합니다.
- 작성자 본인만 수정/삭제 버튼을 볼 수 있는지 확인합니다.
- 다른 사용자의 게시글 수정/삭제 요청이 403으로 거부되는지 확인합니다.
- 삭제 후 관련 댓글/답글/반응/북마크가 남지 않는지 확인합니다.

---

## 9. 댓글 / 답글 / 댓글 수정 / 익명 댓글

### 기능 설명

게시글 상세 화면에서 댓글과 1단계 답글을 작성, 조회, 수정, 삭제할 수 있습니다. 댓글과 답글 모두 익명 작성이 가능합니다.

### 동작 방식

- 댓글은 `parentId=null`로 저장됩니다.
- 답글은 부모 댓글의 id를 `parentId`로 저장합니다.
- 답글의 답글은 서버에서 400으로 거부합니다.
- 본인이 작성한 댓글/답글에만 수정/삭제 버튼이 표시됩니다.
- 익명 댓글/답글은 화면에서 작성자를 “익명”으로 표시합니다.
- 내부적으로는 `userId`를 유지하여 수정/삭제 권한을 검증합니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/posts/:postId/comments` | 댓글/답글 조회 |
| POST | `/api/posts/:postId/comments` | 댓글/답글 작성 |
| PUT | `/api/comments/:id` | 댓글/답글 수정 |
| DELETE | `/api/comments/:id` | 댓글/답글 삭제 |

| DB 모델 | 관련 필드 |
|---|---|
| Comment | `content`, `postId`, `userId`, `parentId`, `isAnonymous`, `createdAt`, `updatedAt` |

### 관련 화면

- `public/post-detail.html`

### [캡처 삽입 위치]

```md
![댓글 목록](./screenshots/03-comments/comments.png)
![답글 작성](./screenshots/03-comments/comment-replies.png)
![댓글 수정](./screenshots/03-comments/comment-edit.png)
![익명 댓글](./screenshots/03-comments/anonymous-comment.png)
![답글의 답글 제한](./screenshots/03-comments/reply-depth-limit.png)
```

### 검증 내용

- 댓글 작성 후 목록에 즉시 반영되는지 확인합니다.
- 답글이 일반 댓글 아래에 들여쓰기 형태로 표시되는지 확인합니다.
- 답글의 답글 작성 시도가 거부되는지 확인합니다.
- 본인 댓글/답글만 수정/삭제 가능한지 확인합니다.
- 익명 댓글/답글 수정 후에도 작성자가 “익명”으로 유지되는지 확인합니다.

---

## 10. 좋아요 / 싫어요 / 북마크

### 기능 설명

로그인 사용자는 게시글에 좋아요, 싫어요, 북마크를 할 수 있습니다. 좋아요와 싫어요는 동시에 적용되지 않도록 처리합니다.

### 동작 방식

- 한 사용자는 한 게시글에 좋아요를 한 번만 누를 수 있습니다.
- 한 사용자는 한 게시글에 싫어요를 한 번만 누를 수 있습니다.
- 좋아요 상태에서 싫어요를 누르면 좋아요가 삭제되고 싫어요가 생성됩니다.
- 싫어요 상태에서 좋아요를 누르면 싫어요가 삭제되고 좋아요가 생성됩니다.
- 북마크는 중복 저장되지 않습니다.
- 상세 응답에는 현재 사용자의 liked, disliked, bookmarked 상태와 count가 포함됩니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/posts/:postId/like` | 좋아요 |
| DELETE | `/api/posts/:postId/like` | 좋아요 취소 |
| POST | `/api/posts/:postId/dislike` | 싫어요 |
| DELETE | `/api/posts/:postId/dislike` | 싫어요 취소 |
| POST | `/api/posts/:postId/bookmark` | 북마크 |
| DELETE | `/api/posts/:postId/bookmark` | 북마크 취소 |

| DB 모델 | 제약 |
|---|---|
| Like | `@@unique([postId, userId])` |
| Dislike | `@@unique([postId, userId])` |
| Bookmark | `@@unique([postId, userId])` |

### 관련 화면

- `public/post-detail.html`
- `public/index.html`
- `public/mypage.html`

### [캡처 삽입 위치]

```md
![좋아요 싫어요 북마크](./screenshots/04-likes/reactions-bookmark.png)
![좋아요 싫어요 전환](./screenshots/04-likes/like-dislike-switch.png)
![북마크 목록](./screenshots/04-likes/bookmark-list.png)
```

### 검증 내용

- 좋아요/싫어요/북마크 버튼 클릭 시 count와 상태가 갱신되는지 확인합니다.
- 좋아요와 싫어요가 동시에 적용되지 않는지 확인합니다.
- 같은 게시글에 중복 좋아요/북마크가 생성되지 않는지 확인합니다.
- 비로그인 사용자는 반응 기능 사용이 제한되는지 확인합니다.

---

## 11. 마이페이지

### 기능 설명

마이페이지에서는 로그인 사용자의 계정 정보와 활동 내역을 확인할 수 있습니다.

### 동작 방식

- 비로그인 사용자가 접근하면 로그인 안내 또는 로그인 페이지 이동 처리를 합니다.
- 로그인 사용자는 내 정보, 작성한 글, 작성한 댓글/답글, 좋아요, 싫어요, 북마크 목록을 확인합니다.
- 작성한 글 목록은 카테고리 필터를 지원합니다.
- 닉네임 변경과 회원 탈퇴도 마이페이지에서 수행합니다.

### 관련 API 또는 DB

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/auth/me/activity` | 현재 사용자 활동 조회 |
| PATCH | `/api/auth/me` | 닉네임 변경 |
| DELETE | `/api/auth/me` | 회원 탈퇴 |

| DB 모델 | 표시 데이터 |
|---|---|
| User | 닉네임, 이메일, 가입일 |
| Post | 내가 작성한 게시글 |
| Comment | 내가 작성한 댓글/답글 |
| Like/Dislike/Bookmark | 내가 반응한 게시글 |

### 관련 화면

- `public/mypage.html`

### [캡처 삽입 위치]

```md
![마이페이지 내 정보](./screenshots/01-auth/mypage-profile.png)
![마이페이지 작성 글](./screenshots/02-posts/mypage-posts.png)
![마이페이지 댓글](./screenshots/03-comments/mypage-comments.png)
![마이페이지 북마크](./screenshots/04-likes/mypage-bookmarks.png)
```

### 검증 내용

- 로그인 후 마이페이지 접근이 가능한지 확인합니다.
- 비로그인 상태에서 마이페이지 접근이 제한되는지 확인합니다.
- 작성한 글, 댓글, 좋아요, 싫어요, 북마크 목록이 표시되는지 확인합니다.
- 닉네임 변경 후 헤더와 마이페이지 정보가 갱신되는지 확인합니다.

---

## 12. 공유 링크

### 기능 설명

게시글 상세 화면에서 현재 게시글 URL을 클립보드에 복사할 수 있습니다.

### 동작 방식

- 공유 버튼을 클릭하면 현재 origin과 게시글 id를 조합합니다.
- 복사 형식은 `/post-detail.html?id=게시글ID`입니다.
- `navigator.clipboard`를 우선 사용하고 실패 시 fallback 처리를 합니다.
- 비로그인 사용자도 공유 기능을 사용할 수 있습니다.

### 관련 API 또는 DB

- 별도 DB 저장 없음
- 별도 API 호출 없음
- 클라이언트에서 현재 URL 기준으로 링크 생성

### 관련 화면

- `public/post-detail.html`

### [캡처 삽입 위치]

```md
![게시글 공유](./screenshots/04-likes/share-link.png)
```

### 검증 내용

- 공유 버튼 클릭 시 “게시글 링크가 복사되었습니다.” 메시지가 표시되는지 확인합니다.
- 복사된 링크를 새 탭에 붙여넣으면 같은 게시글 상세 화면이 열리는지 확인합니다.
- 비로그인 상태에서도 공유 버튼이 동작하는지 확인합니다.

---

## 13. 도움말 투어

### 기능 설명

메인 게시판 페이지에는 주요 기능을 단계별로 설명하는 도움말 투어가 있습니다.

### 동작 방식

- 도움말 버튼 클릭 시 overlay와 안내 팝업이 표시됩니다.
- 게시판 바로가기, 표시 개수, 정렬, 검색, 게시글 목록, 글쓰기, 다크모드, 마이페이지 기능을 순서대로 안내합니다.
- 요소가 없으면 해당 단계를 건너뛰거나 로그인 후 사용 가능 문구로 처리합니다.
- ESC 키 또는 완료/건너뛰기 버튼으로 종료할 수 있습니다.

### 관련 API 또는 DB

- 별도 DB 저장 없음
- 별도 API 호출 없음
- `public/js/posts.js`와 CSS로 클라이언트 UI 처리

### 관련 화면

- `public/index.html`

### [캡처 삽입 위치]

```md
![도움말 투어 시작](./screenshots/99-final/help-tour-start.png)
![도움말 투어 단계](./screenshots/99-final/help-tour-step.png)
```

### 검증 내용

- 도움말 버튼 클릭 시 투어가 시작되는지 확인합니다.
- 다음/이전/건너뛰기/완료 버튼이 동작하는지 확인합니다.
- ESC 키로 투어가 종료되는지 확인합니다.
- 다크모드에서도 overlay와 팝업이 잘 보이는지 확인합니다.

---

## 14. 다크모드 / UI 개선

### 기능 설명

전체 주요 페이지에서 라이트/다크모드 전환과 hover 인터랙션을 지원합니다. footer에는 과제 정보와 GitHub 링크를 제공합니다.

### 동작 방식

- 테마는 `data-theme` 속성과 CSS 변수로 적용합니다.
- 사용자가 선택한 테마는 localStorage에 저장됩니다.
- 버튼, 카드, 게시판 바로가기, 링크에는 hover/active 효과가 적용됩니다.
- 주요 페이지 하단에는 과제 정보와 GitHub 링크가 표시됩니다.

### 관련 API 또는 DB

- 별도 DB 저장 없음
- localStorage key: `cwnu-community-theme`

### 관련 화면

- `public/index.html`
- `public/login.html`
- `public/register.html`
- `public/post-write.html`
- `public/post-detail.html`
- `public/mypage.html`

### [캡처 삽입 위치]

```md
![라이트모드](./screenshots/99-final/light-mode.png)
![다크모드](./screenshots/99-final/dark-mode.png)
![footer](./screenshots/99-final/footer.png)
```

### 검증 내용

- 각 페이지에서 테마 전환 버튼이 보이는지 확인합니다.
- 새로고침 후에도 선택한 테마가 유지되는지 확인합니다.
- 다크모드에서 텍스트, 버튼, 테이블, footer가 잘 보이는지 확인합니다.
- hover 효과가 레이아웃을 깨지 않는지 확인합니다.

---

## 15. 개발용 seed 데이터

### 기능 설명

개발 및 기능 설명서 캡처를 위해 테스트 데이터를 자동 생성하는 seed 스크립트를 제공합니다.

### 동작 방식

- 실행 시 기존 데이터를 삭제한 뒤 새 더미 데이터를 생성합니다.
- 삭제 순서는 외래키 관계를 고려합니다.
- `NODE_ENV=production`이면 실행을 중단합니다.
- `--confirm` 인자가 없으면 실행을 중단합니다.
- 테스트 계정의 비밀번호는 모두 `test1234!`입니다.

### 관련 API 또는 DB

| 파일 | 설명 |
|---|---|
| `scripts/seed-dev.js` | 개발용 데이터 초기화/생성 |
| User | 테스트 사용자 |
| Post | 카테고리별 게시글 |
| Comment | 댓글/답글 |
| Like/Dislike/Bookmark | 반응 데이터 |

### 관련 화면

- seed 실행 후 전체 UI 화면
- Prisma Studio 데이터 확인 화면

### [캡처 삽입 위치]

```md
![seed 실행 결과](./screenshots/06-database/seed-result.png)
![seed 데이터 목록](./screenshots/06-database/seed-board-data.png)
```

### 검증 내용

- `node --check scripts/seed-dev.js`가 통과하는지 확인합니다.
- `npm run db:seed:dev -- --confirm` 실행 후 데이터가 생성되는지 확인합니다.
- production 환경에서는 실행이 차단되는지 확인합니다.
- 메인 목록과 카테고리별 게시글이 정상 표시되는지 확인합니다.

---

## 16. DB cascade 삭제 검증

### 기능 설명

게시글 삭제와 회원 탈퇴 시 연결된 데이터가 남지 않도록 cascade 삭제를 검증합니다.

### 동작 방식

- Post 삭제 시 Comment, Like, Dislike, Bookmark가 함께 삭제됩니다.
- User 삭제 시 해당 사용자가 작성한 Post, Comment와 반응 데이터가 삭제됩니다.
- 부모 댓글 삭제 시 연결된 답글도 삭제됩니다.
- 회원 탈퇴는 현재 로그인 사용자 기준으로 처리하며 프론트에서 userId를 받지 않습니다.

### 관련 API 또는 DB

| 삭제 상황 | 관련 API | 관련 DB |
|---|---|---|
| 게시글 삭제 | `DELETE /api/posts/:id` | Post, Comment, Like, Dislike, Bookmark |
| 회원 탈퇴 | `DELETE /api/auth/me` | User, Post, Comment, Like, Dislike, Bookmark |
| 댓글 삭제 | `DELETE /api/comments/:id` | Comment self relation |

### 관련 화면

- 게시글 상세 화면
- 마이페이지 회원 탈퇴 영역
- Prisma Studio

### [캡처 삽입 위치]

```md
![게시글 삭제 전후 DB](./screenshots/06-database/cascade-post-delete.png)
![회원 탈퇴 전후 DB](./screenshots/06-database/cascade-user-delete.png)
![부모 댓글 삭제 전후 DB](./screenshots/06-database/cascade-comment-delete.png)
```

### 검증 내용

- 게시글 삭제 후 해당 게시글의 댓글/답글/좋아요/싫어요/북마크가 남지 않는지 확인합니다.
- 회원 탈퇴 후 사용자의 게시글/댓글/반응/북마크가 삭제되는지 확인합니다.
- 다른 사용자의 게시글은 회원 탈퇴 후에도 유지되는지 확인합니다.
- 부모 댓글 삭제 후 답글이 함께 삭제되는지 확인합니다.

---

## 17. AI 활용 명시

### 기능 설명

프로젝트 구현 및 문서 정리 과정에서 AI 도구를 활용했습니다. 과제 제출 시 AI 활용 사실과 활용 범위를 명시합니다.

### 동작 방식

- 구현 전략 수립과 코드 작성 보조에 AI를 활용했습니다.
- UI/UX 개선, 오류 분석, README 정리, 테스트 체크리스트 작성에 AI를 활용했습니다.
- 최종 기능 동작과 제출 문서는 제출자가 직접 검토했습니다.

### 관련 API 또는 DB

- 관련 API 없음
- 관련 DB 없음

### 관련 화면

- README 부록의 AI 활용 명시
- 별도 문서 작성 시 `docs/ai-usage.md`

### [캡처 삽입 위치]

별도 화면 캡처 없음. AI 활용 사실은 README 부록과 `docs/ai-usage.md` 문서로 제출합니다.

### 검증 내용

- README에 AI 활용 도구와 활용 범위가 명시되어 있는지 확인합니다.
- 실제 프롬프트 전문이나 민감정보를 임의로 작성하지 않았는지 확인합니다.
- AI 결과물을 제출자가 검토했다는 점이 문서에 포함되어 있는지 확인합니다.

---

## 18. 결론

### 기능 설명

본 프로젝트는 데이터베이스개론 과제 요구사항을 충족하는 Node.js 기반 DBMS 웹 게시판입니다. 필수 기능 외에도 카테고리, 공지사항, 인기글, 댓글 답글, 익명 작성, 북마크, 마이페이지, 다크모드, 도움말 투어 등을 추가하여 실제 커뮤니티 서비스에 가까운 형태로 확장했습니다.

### 동작 방식

- 프론트엔드는 정적 HTML/CSS/Vanilla JS로 구성했습니다.
- 서버는 Express REST API로 구성했습니다.
- 데이터는 PostgreSQL과 Prisma ORM으로 관리했습니다.
- 인증은 JWT httpOnly cookie로 유지했습니다.
- 배포는 Vercel 서버리스 Express 구조를 고려했습니다.

### 관련 API 또는 DB

- 전체 API: `server/routes/`
- 전체 DB 모델: `prisma/schema.prisma`
- 환경변수 예시: `.env.example`
- 배포 설정: `vercel.json`, `api/index.js`

### 관련 화면

- 전체 주요 페이지
- 기능 설명서용 최종 캡처 화면

### [캡처 삽입 위치]

```md
![최종 메인 화면](./screenshots/99-final/main-board.png)
![최종 상세 화면](./screenshots/99-final/post-detail.png)
![최종 마이페이지](./screenshots/99-final/mypage.png)
```

### 검증 내용

- 과제 필수 기능이 모두 동작하는지 확인합니다.
- 게시글 삭제와 회원 탈퇴 시 cascade 삭제가 정상 동작하는지 확인합니다.
- 로그인, 권한 검증, 익명 표시, 반응 전환이 정상 동작하는지 확인합니다.
- README와 기능 설명서의 기능 설명이 실제 구현과 충돌하지 않는지 확인합니다.

