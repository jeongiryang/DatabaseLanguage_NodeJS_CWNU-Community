# Screenshot Map Review

이 문서는 `docs/screenshot-manifests/screenshot-map.csv` 정리 과정에서 자동 보정/자동 매핑한 내용과 사용자가 직접 확인해야 할 항목을 기록한 검토 문서입니다.

## 1. 제거한 Smart Portal 항목

소프트웨어공학 과제 평가 기간이 아직 진행 중이므로, 이번 DB 과제 최종 스크린샷 정리에서는 아래 Smart Portal 관련 target을 CSV에서 제외했습니다.

| target | 처리 |
|---|---|
| `99-final/smart-portal-main.png` | 제거 |
| `99-final/smart-portal-community-link.png` | 제거 |
| `99-final/smart-portal-market-link.png` | 제거 |
| `99-final/smart-portal-lost-link.png` | 제거 |

## 2. `raw/` 접두어 자동 보정 항목

source가 채워져 있었지만 `raw/` 접두어가 없던 항목에 접두어를 보정했습니다.

| target | 보정된 source |
|---|---|
| `99-final/main-board.png` | `raw/스크린샷 2026-05-15 161928.png` |
| `99-final/mypage.png` | `raw/스크린샷 2026-05-15 183807.png` |
| `99-final/dark-mode.png` | `raw/스크린샷 2026-05-15 223136.png` |
| `99-final/help-tour.png` | `raw/스크린샷 2026-05-15 231008.png` |
| `99-final/footer.png` | `raw/스크린샷 2026-05-15 230120.png` |
| `01-auth/register.png` | `raw/스크린샷 2026-05-14 183536.png` |
| `01-auth/login.png` | `raw/스크린샷 2026-05-14 183840.png` |
| `01-auth/auth-header.png` | `raw/스크린샷 2026-05-14 183848.png` |
| `01-auth/password-toggle.png` | `raw/스크린샷 2026-05-15 131042.png` |

## 3. source 파일 존재 여부 검증 결과

CSV에 source가 채워진 항목은 모두 `raw/`로 시작하도록 정리했습니다.

| 구분 | 결과 |
|---|---|
| 존재하는 source | 채워진 source 전체 |
| 존재하지 않는 source | 없음 |
| 오타 의심 source | 없음 |

## 4. 자동으로 source를 채운 항목

이미지 내용을 확인했을 때 의미가 비교적 명확한 항목만 자동으로 매핑했습니다.

| target | source | 판단 근거 |
|---|---|---|
| `99-final/project-structure.png` | `raw/스크린샷 2026-05-15 085435.png` | VS Code 프로젝트 구조 화면 |
| `99-final/post-detail.png` | `raw/스크린샷 2026-05-15 230138.png` | 게시글 상세와 반응 버튼이 함께 보임 |
| `02-posts/post-detail.png` | `raw/스크린샷 2026-05-15 230138.png` | 게시글 상세 화면 |
| `03-comments/comments.png` | `raw/스크린샷 2026-05-15 215822.png` | 댓글과 답글 목록이 함께 보임 |
| `03-comments/comment-edit.png` | `raw/스크린샷 2026-05-15 221016.png` | 댓글/답글 수정 완료와 수정일 표시가 보임 |
| `03-comments/reply-depth-limit.png` | `raw/스크린샷 2026-05-15 220121.png` | 일반 댓글에는 `답글` 버튼이 보이고, 답글 항목에는 추가 답글 버튼이 없어 1단계 제한을 설명하기 적합함 |
| `04-likes/reactions-bookmark.png` | `raw/스크린샷 2026-05-15 224528.png` | 좋아요, 싫어요, 북마크 버튼과 수치가 보임 |
| `04-likes/like-dislike-switch.png` | `raw/스크린샷 2026-05-15 124849.png` | 싫어요 선택 상태와 좋아요 비선택 상태가 보임 |
| `04-likes/bookmark-list.png` | `raw/스크린샷 2026-05-15 181415.png` | 북마크한 게시글 목록이 보임 |
| `04-likes/mypage-bookmarks.png` | `raw/스크린샷 2026-05-15 181415.png` | 마이페이지 북마크 탭 화면 |
| `04-likes/share-link.png` | `raw/스크린샷 2026-05-15 155124.png` | 게시글 링크 복사 성공 메시지가 보임 |
| `05-pagination-sort/main-board.png` | `raw/스크린샷 2026-05-15 161928.png` | 메인 게시글 목록 화면 |
| `05-pagination-sort/notice-board.png` | `raw/스크린샷 2026-05-15 170533.png` | 공지사항 게시판 active 상태 |
| `05-pagination-sort/hot-board.png` | `raw/스크린샷 2026-05-15 165201.png` | 인기글 게시판 active 상태 |
| `05-pagination-sort/market-board.png` | `raw/스크린샷 2026-05-15 153448.png` | 중고장터 카테고리 목록 |
| `05-pagination-sort/lost-board.png` | `raw/스크린샷 2026-05-15 153458.png` | 분실물 카테고리 목록 |
| `05-pagination-sort/search.png` | `raw/스크린샷 2026-05-15 153600.png` | 검색어 입력 후 결과 목록 |
| `05-pagination-sort/sort-latest.png` | `raw/스크린샷 2026-05-15 153400.png` | 최신순 정렬 선택 상태 |
| `05-pagination-sort/sort-likes.png` | `raw/스크린샷 2026-05-15 153432.png` | 좋아요순 정렬 선택 상태 |
| `05-pagination-sort/sort-views.png` | `raw/스크린샷 2026-05-15 153416.png` | 조회수순 정렬 선택 상태 |
| `05-pagination-sort/sort-comments.png` | `raw/스크린샷 2026-05-15 230126.png` | 정렬 select에 댓글순 옵션이 보임 |
| `05-pagination-sort/pagination.png` | `raw/스크린샷 2026-05-15 131448.png` | 표시 개수와 페이지 버튼이 보임 |
| `06-database/prisma-studio-models.png` | `raw/스크린샷 2026-05-15 181344.png` | Prisma Studio 모델 목록과 데이터가 보임 |
| `06-database/seed-board-data.png` | `raw/스크린샷 2026-05-15 153514.png` | Prisma Studio에서 seed 게시글 데이터가 보임 |
| `06-database/cascade-post-delete.png` | `raw/스크린샷 2026-05-15 121129.png` | Prisma Studio Post 테이블에서 삭제 대상 게시글이 사라진 상태가 보임 |
| `06-database/cascade-user-delete.png` | `raw/스크린샷 2026-05-15 121319.png` | Prisma Studio User 테이블에서 탈퇴 대상 사용자가 사라진 상태가 보임 |

## 5. 확신이 낮아 비워둔 항목

아래 항목은 raw 이미지 안에서 의미가 완전히 일치하는 화면을 확인하지 못했거나, 단순 UI 화면만으로 DB 검증 캡처라고 보기 어려워 source를 비워두었습니다.

| target | 비워둔 이유 | 후보 source |
|---|---|---|
| `06-database/seed-result.png` | seed 실행 완료 터미널 출력 화면을 확인하지 못함 | 후보 없음. `npm run db:seed:dev -- --confirm` 실행 결과 캡처 필요 |
| `06-database/cascade-comment-delete.png` | 댓글 삭제 UI는 있으나 부모 댓글 삭제 시 답글 cascade 검증 화면으로는 불충분함 | `raw/스크린샷 2026-05-15 220216.png`, `raw/스크린샷 2026-05-15 220226.png` |

## 6. 사용자가 직접 확인해야 할 항목

1. `05-pagination-sort/sort-comments.png`는 댓글순 정렬 결과 화면이 아니라 정렬 select의 `댓글순` 옵션 화면입니다. 실제 정렬 결과 화면이 필요하면 새 캡처로 교체하는 것이 좋습니다.
2. `06-database/seed-result.png`는 seed 실행 터미널 출력 캡처를 새로 확보해야 합니다.
3. `06-database/cascade-post-delete.png`와 `06-database/cascade-user-delete.png`는 삭제 후 대상 데이터가 사라진 Prisma Studio 화면으로 매핑했습니다. 엄밀한 cascade 증빙이 필요하면 관련 댓글/반응/북마크 테이블까지 함께 보이는 추가 캡처를 보강하는 것이 좋습니다.
4. `06-database/cascade-comment-delete.png`는 부모 댓글 삭제 후 답글까지 사라진 DB 확인 화면을 새로 확보하는 것이 좋습니다.
5. Smart Portal 연결 화면은 소프트웨어공학 과제 평가 완료 후 별도 단계에서 다시 추가하면 됩니다.
