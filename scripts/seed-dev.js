require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PASSWORD = "test1234!";
const SALT_ROUNDS = 12;
const CATEGORY_LABELS = {
  notice: "공지사항",
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const users = [
  { email: "algo@cwnu.ac.kr", nickname: "알고리즘장인" },
  { email: "campuscat@cwnu.ac.kr", nickname: "캠퍼스고양이" },
  { email: "assignment@cwnu.ac.kr", nickname: "과제폭격기" },
  { email: "dbmaster@cwnu.ac.kr", nickname: "DB마스터" },
  { email: "potato@cwnu.ac.kr", nickname: "코딩하는감자" },
  { email: "dawnlib@cwnu.ac.kr", nickname: "새벽도서관" },
  { email: "hello543@cwnu.ac.kr", nickname: "hello543" },
  { email: "king@cwnu.ac.kr", nickname: "킹왕짱" },
];

const postSeeds = {
  notice: [
    ["커뮤니티 이용 안내", "CWNU Community는 학내 구성원을 위한 게시판입니다. 욕설, 비방, 개인정보 노출은 삼가고 서로에게 도움이 되는 글을 남겨주세요."],
    ["중고장터 거래 유의사항", "중고장터 게시글은 일반 게시글 카테고리로 운영됩니다. 거래 장소와 시간을 명확히 정하고 개인정보는 댓글에 남기지 않는 것을 권장합니다."],
    ["분실물 게시판 이용 방법", "분실물 글에는 발견 또는 분실 위치, 시간, 특징을 구체적으로 작성해주세요. 민감한 정보는 직접 노출하지 않도록 주의해주세요."],
    ["시험기간 게시판 운영 안내", "시험기간에는 공부 자료 공유와 질문 글이 늘어납니다. 과제 정답 공유나 부정행위로 오해될 수 있는 내용은 작성하지 말아주세요."],
    ["서비스 점검 테스트 공지", "개발용 더미 데이터로 생성된 공지입니다. 최종 제출 캡처에서는 공지사항 카테고리와 인기글 필터 확인용으로 사용할 수 있습니다."],
  ],
  free: [
    ["봉림관 돈가스 오늘도 줄 긴가요", "점심시간에 20분 안에 먹고 수업 가야 합니다. 오늘 봉림관 줄 상태 어떤지 실시간 제보 받습니다."],
    ["사림관 카페 콘센트 자리 지도 필요합니다", "팀플 자료 정리하려고 했는데 콘센트 자리가 생각보다 빨리 차네요. 조용하고 전원 있는 자리 추천해주세요."],
    ["비 오는 날 학교가 갑자기 영화 세트장", "도서관 앞길이 조용해서 좋았는데 운동화는 완전히 젖었습니다. 내일은 장화 신고 등교할까 고민 중입니다."],
    ["공강 3시간 생겼을 때 다들 뭐하세요", "도서관 가면 잠들고 카페 가면 돈 쓰고 동방은 멀어서 애매합니다. 현실적인 공강 생존법 공유해주세요."],
    ["축제 푸드트럭 어디가 괜찮았나요", "저녁에 친구들이랑 한 바퀴 돌 예정입니다. 실패 확률 낮은 메뉴 있으면 추천 부탁드립니다."],
    ["오늘 중앙도서관 자리 전쟁 승리했습니다", "아침 8시 40분에 갔더니 창가 자리가 남아 있었습니다. 시험기간에는 역시 부지런함이 최고의 스펙입니다."],
  ],
  study: [
    ["데이터베이스 정규화 10분 요약", "1NF는 반복 그룹 제거, 2NF는 부분 종속 제거, 3NF는 이행 종속 제거로 기억하니 문제 풀이 속도가 빨라졌습니다."],
    ["SQL JOIN 문제 풀 때 안 헷갈리는 법", "결과에 남아야 하는 행이 어느 테이블 기준인지 먼저 표시해두면 INNER JOIN과 LEFT JOIN 실수가 줄어듭니다."],
    ["운영체제 스터디 한 명 더 구합니다", "프로세스 동기화부터 가상 메모리까지 주 2회 짧게 문제 풀이합니다. 말로 설명하면서 공부할 분 환영합니다."],
    ["시험기간 공부 루틴 공유합니다", "오전에는 암기 과목, 오후에는 코딩 과제, 밤에는 오답 정리로 돌리고 있습니다. 수면을 줄이면 다음 날 바로 망합니다."],
    ["Prisma 모델 관계 외우는 팁", "일대다 관계는 배열이 어느 쪽에 붙는지 먼저 보고, 외래키 필드는 실제 컬럼이 있는 모델에 둔다고 생각하면 편했습니다."],
    ["기말 프로젝트 일정표 이렇게 짰습니다", "화면, API, DB, 문서 캡처를 따로 나누고 매일 하나씩만 끝내는 방식이 생각보다 안정적입니다."],
  ],
  question: [
    ["Prisma migrate dev가 자꾸 멈춥니다", "schema.prisma를 바꾼 뒤 validate는 통과하는데 migrate dev에서 막힙니다. 기존 데이터가 있을 때 확인할 순서가 궁금합니다."],
    ["httpOnly cookie 로그인 상태 확인 질문", "로그인은 되는데 새로고침 후 /api/auth/me가 unauthenticated로 나옵니다. SameSite와 secure 옵션 중 어디부터 봐야 할까요?"],
    ["Neon DATABASE_URL과 DIRECT_URL 차이", "pooled URL과 direct URL을 둘 다 쓰는 이유를 아직 정확히 모르겠습니다. Prisma 기준으로 설명 가능하신 분 있나요?"],
    ["검색과 카테고리 필터를 같이 쓰는 where 조건", "title, content, author nickname 검색에 category 필터까지 섞을 때 Prisma where 구조를 어떻게 잡는 게 깔끔할까요?"],
    ["좋아요 싫어요 동시 선택 방지 방식", "likes와 dislikes 테이블을 따로 두면 동시에 들어가는 걸 서버 트랜잭션으로 막는 게 맞는지 궁금합니다."],
    ["Vercel 배포 후 쿠키가 안 잡힐 때", "로컬에서는 로그인 유지가 되는데 배포 주소에서는 쿠키가 저장되지 않습니다. COOKIE_SECURE 설정 외에 확인할 게 있을까요?"],
  ],
  info: [
    ["도서관 시험기간 연장 운영 확인", "이번 주부터 일부 열람실이 늦게까지 열린다고 합니다. 좌석 예약 방식은 기존과 같으니 앱에서 확인하세요."],
    ["장학금 신청 마감 임박", "교내 장학금 신청 기간이 얼마 남지 않았습니다. 성적증명서와 통장 사본이 필요한 경우 미리 준비하는 게 좋습니다."],
    ["수강정정 기간 체크하세요", "인기 강의는 자리가 갑자기 생겼다가 바로 사라집니다. 대기 중인 과목이 있으면 하루에 여러 번 확인해보세요."],
    ["학생상담센터 프로그램 공유", "시험 스트레스 관리 프로그램이 열립니다. 혼자 버티기 힘든 시기에는 이런 프로그램도 꽤 도움이 됩니다."],
    ["셔틀버스 시간표 일부 변경", "아침 등교 시간대 일부 노선이 조정됐다고 합니다. 첫 수업이 빠른 분들은 전날 꼭 확인하세요."],
    ["출력 가능한 장소 정리", "중앙도서관, 공대 일부 건물, 학생회관에서 출력 가능합니다. 잔액 충전과 파일 형식 확인을 미리 해두세요."],
  ],
  market: [
    ["데이터베이스 전공책 판매합니다", "Database System Concepts 책 판매합니다. 겉표지 사용감은 있지만 필기는 거의 없고 과제할 때 참고하기 좋습니다."],
    ["무선 키보드 저렴하게 양도", "강의 필기용으로 쓰던 블루투스 키보드입니다. 박스 있고 배터리 상태 괜찮습니다. 학교 안에서 거래 가능합니다."],
    ["공학용 계산기 판매", "기사 시험 준비하면서 사용한 계산기입니다. 기능 정상이고 버튼 눌림도 문제 없습니다."],
    ["노트북 거치대 판매합니다", "도서관에서 쓰기 좋은 접이식 거치대입니다. 가방에 넣고 다니기 편한 크기입니다."],
    ["컴퓨터공학 전공책 묶음 정리", "자료구조, 운영체제, 네트워크 책을 정리합니다. 묶음 우선이고 필요하면 개별 판매도 가능합니다."],
    ["미개봉 텀블러 판매", "선물로 받았는데 이미 쓰는 게 있어서 판매합니다. 포장 그대로라 선물용으로도 괜찮습니다."],
  ],
  lost: [
    ["학생증을 찾습니다", "오늘 오후 중앙도서관 근처에서 학생증을 잃어버렸습니다. 이름 일부와 학번 뒤자리를 확인하고 받을 수 있게 댓글 부탁드립니다."],
    ["에어팟 케이스 습득했습니다", "사림관 1층 복도에서 케이스를 주웠습니다. 색상과 스티커 특징을 알려주시면 전달드리겠습니다."],
    ["검은색 지갑 분실", "학생회관 근처에서 검은색 지갑을 잃어버렸습니다. 카드와 학생증이 들어 있어 급하게 찾고 있습니다."],
    ["공대 강의실 충전기 두고 왔어요", "공대 3호관 강의실에 노트북 충전기를 두고 나온 것 같습니다. 혹시 보관 중인 분 계실까요?"],
    ["파란색 우산 습득", "도서관 입구 우산꽂이 옆에 있던 파란색 우산을 분실물 보관 쪽에 맡겨두었습니다."],
    ["분홍색 필통 찾습니다", "오전 수업 후 필통이 없어졌습니다. 경영대 강의실이나 복도에서 보신 분은 알려주세요."],
  ],
};

const commentTemplates = [
  "이거 진짜 필요했던 정보예요. 감사합니다.",
  "저도 방금 확인했는데 아직 가능했습니다.",
  "혹시 정확한 위치나 시간도 알 수 있을까요?",
  "저는 반대로 이 방법은 조금 불편하더라고요.",
  "댓글 보고 바로 확인하러 갑니다.",
  "좋은 글 감사합니다. 캡처해두겠습니다.",
  "필요하면 제가 같이 확인해드릴게요.",
  "공지사항이랑 포털도 같이 확인하면 좋을 것 같습니다.",
  "저도 비슷한 상황이었는데 도움이 됐습니다.",
  "거래나 분실물 관련이면 개인정보는 조심하는 게 좋겠습니다.",
];

function assertSafeToRun() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to seed development data while NODE_ENV is production.");
    process.exit(1);
  }

  if (!process.argv.includes("--confirm")) {
    console.error("This script deletes existing data before seeding.");
    console.error("Run with: npm run db:seed:dev -- --confirm");
    process.exit(1);
  }
}

function createRandom(seed) {
  let value = seed;

  return function random() {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20260515);

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randomInt(0, items.length - 1)];
}

function makeDate(daysAgo, hourOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + hourOffset, randomInt(0, 55), 0, 0);
  return date;
}

function makePostDates(index) {
  const createdAt = makeDate(randomInt(0, 6), index % 8);

  if (index % 3 === 0) {
    return {
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randomInt(0, 900)),
    };
  }

  return {
    createdAt,
    updatedAt: new Date(createdAt.getTime() + randomInt(2, 30) * 60 * 60 * 1000),
  };
}

function makeCommentDate(postCreatedAt, index) {
  return new Date(postCreatedAt.getTime() + (index + 1) * randomInt(15, 180) * 60 * 1000);
}

async function resetData(tx) {
  await tx.dislike.deleteMany();
  await tx.like.deleteMany();
  await tx.comment.deleteMany();
  await tx.post.deleteMany();
  await tx.user.deleteMany();
}

async function seedUsers(tx, passwordHash) {
  const createdUsers = [];

  for (const user of users) {
    createdUsers.push(
      await tx.user.create({
        data: {
          ...user,
          passwordHash,
        },
      })
    );
  }

  return createdUsers;
}

async function seedPosts(tx, createdUsers) {
  const createdPosts = [];
  let postIndex = 0;

  for (const [category, posts] of Object.entries(postSeeds)) {
    for (const [title, content] of posts) {
      const author = createdUsers[postIndex % createdUsers.length];
      const { createdAt, updatedAt } = makePostDates(postIndex);

      createdPosts.push(
        await tx.post.create({
          data: {
            category,
            title,
            content,
            viewCount: randomInt(0, 200),
            userId: author.id,
            createdAt,
            updatedAt,
          },
        })
      );

      postIndex += 1;
    }
  }

  return createdPosts;
}

async function seedComments(tx, createdUsers, createdPosts) {
  let count = 0;

  for (const post of createdPosts) {
    const commentCount = randomInt(0, 5);

    for (let index = 0; index < commentCount; index += 1) {
      const author = pick(createdUsers);
      const createdAt = makeCommentDate(post.createdAt, index);

      await tx.comment.create({
        data: {
          postId: post.id,
          userId: author.id,
          content: pick(commentTemplates),
          createdAt,
          updatedAt: new Date(createdAt.getTime() + randomInt(0, 900)),
        },
      });

      count += 1;
    }
  }

  return count;
}

async function seedReactions(tx, createdUsers, createdPosts) {
  let likeCount = 0;
  let dislikeCount = 0;

  for (const post of createdPosts) {
    const shuffledUsers = [...createdUsers].sort(() => random() - 0.5);
    const reactionCount = randomInt(2, 7);

    for (let index = 0; index < reactionCount; index += 1) {
      const user = shuffledUsers[index];
      const createdAt = makeCommentDate(post.createdAt, index + 1);

      if (random() < 0.78) {
        await tx.like.create({
          data: {
            postId: post.id,
            userId: user.id,
            createdAt,
          },
        });
        likeCount += 1;
      } else {
        await tx.dislike.create({
          data: {
            postId: post.id,
            userId: user.id,
            createdAt,
          },
        });
        dislikeCount += 1;
      }
    }
  }

  return { likeCount, dislikeCount };
}

function countPostsByCategory(posts) {
  return Object.keys(CATEGORY_LABELS).reduce((counts, category) => {
    if (category !== "all") {
      counts[category] = posts.filter((post) => post.category === category).length;
    }

    return counts;
  }, {});
}

async function main() {
  assertSafeToRun();

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
  let summary;

  await prisma.$transaction(
    async (tx) => {
      await resetData(tx);

      const createdUsers = await seedUsers(tx, passwordHash);
      const createdPosts = await seedPosts(tx, createdUsers);
      const comments = await seedComments(tx, createdUsers, createdPosts);
      const reactions = await seedReactions(tx, createdUsers, createdPosts);

      summary = {
        users: createdUsers.length,
        posts: createdPosts.length,
        comments,
        likes: reactions.likeCount,
        dislikes: reactions.dislikeCount,
        postsByCategory: countPostsByCategory(createdPosts),
      };
    },
    {
      timeout: 30000,
    }
  );

  console.log("Development seed completed.");
  console.log(`Test account password: ${PASSWORD}`);
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error("Development seed failed.");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
