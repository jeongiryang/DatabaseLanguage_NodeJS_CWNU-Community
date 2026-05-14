# AGENTS.md

## Project Overview

This repository is a university database assignment project.

- Project name: `DatabaseLanguage_NodeJS_CWNU-Community`
- Project type: Node.js-based web bulletin board
- Concept: A campus community board that works as an extension service of the existing `CWNU Smart Portal`
- This repository must remain independent from the existing CWNU Smart Portal repository.
- The existing portal may later link to this board through a deployed URL, but this project must be implemented as a separate database assignment repository.

## Core Requirements

This project must prioritize satisfying the database assignment requirements.

Required features:

- User registration
- Login
- Logout
- Password encryption
- View all posts
- Pagination with selectable page sizes: `10`, `20`, `30`, `40`, `50`
- Post list must display:
  - title
  - author
  - created date
  - comment count
  - like count
- View post detail
- View post content and all comments
- Create post
- Delete post
- When a post is deleted, all comments and likes related to that post must also be deleted
- Create comment
- Delete comment
- No nested comments or replies
- Like post
- Cancel like

Additional scoring features to prioritize:

- Prisma ORM
- Promise-based database access
- Cookie-based authentication
- Sort options by latest, likes, and views

## Fixed Technology Stack

Use the following stack unless the user explicitly changes the project direction.

### Backend

- Node.js
- Express.js
- REST API structure
- PostgreSQL
- Prisma ORM
- bcrypt for password hashing
- JWT authentication stored in an `httpOnly` cookie

### Frontend

- Static HTML
- CSS
- Vanilla JavaScript
- Use `fetch()` to call REST APIs

### Strictly Forbidden

- Do not use EJS.
- Do not use server-side template rendering.
- Do not use `express-session` MemoryStore.
- Do not commit `.env`.
- Do not merge this project with the existing CWNU Smart Portal repository.

## Authentication Rules

- Login persistence must use JWT stored in an `httpOnly` cookie.
- Use secure cookie options suitable for deployment.
- Login-required APIs must be protected by authentication middleware.
- Frontend JavaScript must not store JWT in `localStorage` or `sessionStorage`.
- Passwords must be hashed with `bcrypt`.
- Plain text passwords must never be stored.

## Database Rules

Use PostgreSQL with Prisma.

Required tables:

- `users`
- `posts`
- `comments`
- `likes`

Optional table:

- Additional tables may be added only if they clearly support assignment requirements or deployment stability.

### users

Should store user account information.

Recommended fields:

- `id`
- `email` or `username`
- `passwordHash`
- `nickname`
- `createdAt`
- `updatedAt`

### posts

Should store board posts.

Recommended fields:

- `id`
- `userId`
- `title`
- `content`
- `viewCount`
- `createdAt`
- `updatedAt`

### comments

Should store flat comments only.

Recommended fields:

- `id`
- `postId`
- `userId`
- `content`
- `createdAt`
- `updatedAt`

Rules:

- Nested comments are not required.
- Do not implement replies unless the user explicitly requests them.

### likes

Should store post likes.

Recommended fields:

- `id`
- `postId`
- `userId`
- `createdAt`

Rules:

- Add a unique constraint on `(postId, userId)`.
- A user can like the same post only once.
- Like cancellation should delete the matching like row.

### Deletion Rules

- When a post is deleted, all related comments and likes must also be deleted.
- Prefer database-level cascade delete through Prisma relation configuration.
- Application-level deletion may be added if needed, but the final behavior must be guaranteed.

## API Rules

Use REST API routes.

Recommended API structure:

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
DELETE /api/posts/:id

GET    /api/posts/:postId/comments
POST   /api/posts/:postId/comments
DELETE /api/comments/:id

POST   /api/posts/:postId/like
DELETE /api/posts/:postId/like
```

Authorization rules:

- Post creation requires login.
- Post deletion requires login.
- Only the post author can delete their own post.
- Comment creation requires login.
- Comment deletion requires login.
- Only the comment author can delete their own comment.
- Like and unlike require login.

## Post List Rules

The post list must support:

- title
- author
- created date
- comment count
- like count
- pagination
- page size selection: `10`, `20`, `30`, `40`, `50`
- sorting:
  - latest
  - likes
  - views

Recommended query example:

```txt
GET /api/posts?page=1&pageSize=10&sort=latest
GET /api/posts?page=1&pageSize=20&sort=likes
GET /api/posts?page=1&pageSize=30&sort=views
```

Invalid page sizes should be rejected or normalized to a safe default.

## Frontend Rules

- Use static files under `public/`.
- Use `fetch()` for all data operations.
- Do not render data through EJS or any server-side template engine.
- Keep screens clear enough for the final assignment documentation.
- UI should make required features easy to capture in screenshots.
- Login state should be reflected in the header or user area.
- Show or hide write/delete/like controls based on authentication and ownership where possible.
- Server-side authorization must still be enforced even if buttons are hidden on the frontend.

Recommended screens:

- Main post list
- Register
- Login
- Post detail
- Post write
- Optional mypage after required features are complete

## Deployment Rules

The project should be structured with Vercel deployment in mind.

- Keep Express app exportable for Vercel serverless usage.
- Separate local server startup from the Express app definition.
- Use environment variables for secrets and database connection strings.
- Provide `.env.example`.
- Do not commit `.env`.
- Ensure Prisma Client generation works during install/build.
- Avoid file-system based runtime storage.
- Avoid memory-only login sessions.

Required environment variables:

```txt
DATABASE_URL=
JWT_SECRET=
NODE_ENV=
```

Optional environment variables:

```txt
COOKIE_SECURE=
PORT=
```

## Suggested Folder Structure

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
│  └─ js/
├─ docs/
├─ server.js
├─ package.json
├─ .env.example
├─ README.md
└─ AGENTS.md
```

This structure may be adjusted if the existing repository already has a different layout, but the project must remain clear, simple, and suitable for assignment submission.

## Work Process Rules

Before making changes:

- Explain the planned change first.
- Keep work scoped to one feature or small feature group.
- Do not implement too many unrelated features in one step.
- Check the existing files before assuming structure.
- Preserve user changes.
- Do not delete or rewrite unrelated files.

After making changes:

- Summarize changed files.
- Explain why each meaningful change was made.
- Provide a test method.
- State clearly if tests were not run.
- Do not claim that unimplemented features exist.
- Do not exaggerate completeness.

## Documentation Rules

The final submission must include a feature explanation document with screenshots.

Design and implementation should make the following screenshots easy to capture:

- Main post list
- Page size selection: 10/20/30/40/50
- Sort by latest
- Sort by likes
- Sort by views
- Register page
- Login page
- Logged-in header or user area
- Logout result
- Post write page
- Post detail page
- Comment creation
- Comment deletion
- Like
- Unlike
- Post deletion
- Evidence that post deletion also deletes related comments and likes
- Database schema or table view
- AI usage statement

## AI Usage Statement

If AI assistance is used, the final documentation should mention the AI name and version.

Example:

```txt
AI tool used: OpenAI Codex based on GPT-5
Usage: implementation planning, code generation assistance, debugging assistance, and documentation drafting support
```

## Priority Order

When tradeoffs are needed, follow this order:

1. Satisfy assignment requirements
2. Keep implementation simple and explainable
3. Preserve database correctness
4. Maintain secure authentication behavior
5. Keep Vercel deployment compatibility
6. Improve UI polish only after required features work
7. Add optional mypage only after required features are complete
