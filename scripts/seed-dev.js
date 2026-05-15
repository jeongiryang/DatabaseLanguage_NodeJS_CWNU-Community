require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PASSWORD = "test1234!";
const SALT_ROUNDS = 12;
const CATEGORY_LABELS = {
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const users = [
  { email: "minjun@cwnu.ac.kr", nickname: "김민준" },
  { email: "seoyeon@cwnu.ac.kr", nickname: "이서연" },
  { email: "jihoon@cwnu.ac.kr", nickname: "박지훈" },
  { email: "yujin@cwnu.ac.kr", nickname: "최유진" },
  { email: "haneul@cwnu.ac.kr", nickname: "정하늘" },
  { email: "doyoon@cwnu.ac.kr", nickname: "강도윤" },
  { email: "seoa@cwnu.ac.kr", nickname: "윤서아" },
  { email: "jiwoo@cwnu.ac.kr", nickname: "한지우" },
];

const postSeeds = {
  free: [
    ["오늘 점심 메뉴 추천받아요", "봉림관이랑 사림관 중에 어디가 더 괜찮을까요? 오후 수업 전에 빠르게 먹을 곳을 찾고 있습니다."],
    ["비 오는 날 학교 산책하기 좋네요", "도서관 앞길이 생각보다 조용해서 잠깐 걷기 좋았습니다. 다들 우산 꼭 챙기세요."],
    ["동아리 박람회 다녀온 후기", "생각보다 부스가 많아서 둘러보는 데 시간이 꽤 걸렸습니다. 관심 있는 동아리는 미리 질문을 준비하면 좋을 것 같아요."],
    ["공강 시간 보내는 장소 추천", "두 시간 정도 공강이 생겼는데 조용히 쉬거나 과제할 만한 곳이 있을까요?"],
    ["학교 근처 카페 자리 많은 곳", "팀플 회의할 곳을 찾고 있습니다. 콘센트 있고 오래 앉아도 괜찮은 카페 추천 부탁드립니다."],
    ["이번 축제 부스 기대됩니다", "친구들이랑 저녁에 들러보려고 합니다. 괜찮았던 부스 있으면 공유해주세요."],
  ],
  study: [
    ["시험기간 공부 루틴 공유", "오전에는 전공 이론을 정리하고 오후에는 문제 풀이 위주로 돌리고 있습니다. Pomodoro 방식이 꽤 잘 맞네요."],
    ["데이터베이스 정규화 정리", "1NF, 2NF, 3NF를 예시 테이블로 다시 정리해보니 이해가 훨씬 쉬웠습니다. 함수 종속성부터 잡는 게 중요하네요."],
    ["운영체제 스터디 모집합니다", "중간고사 전까지 매주 두 번씩 프로세스, 메모리, 파일 시스템을 같이 정리할 사람을 찾습니다."],
    ["SQL JOIN 문제 풀이 팁", "INNER JOIN과 LEFT JOIN 차이를 결과 행 기준으로 생각하면 실수가 줄어드는 것 같습니다."],
    ["Node.js Express 복습 자료", "라우팅, 미들웨어, 에러 처리 순서가 헷갈려서 간단한 예제로 다시 실습했습니다."],
    ["기말 프로젝트 일정 관리 방법", "기능 단위로 체크리스트를 만들고 매일 짧게 테스트하는 방식이 제일 안정적인 것 같습니다."],
  ],
  question: [
    ["Prisma migration 질문 있습니다", "schema.prisma를 수정한 뒤 migrate dev를 실행했는데 기존 데이터가 어떻게 처리되는지 궁금합니다."],
    ["Node.js 로그인 오류 질문", "로그인은 성공하는데 새로고침 후 로그인 상태가 풀립니다. 쿠키 옵션을 어디부터 확인하면 좋을까요?"],
    ["PostgreSQL 연결 문자열 질문", "Neon에서 pooled URL과 direct URL을 둘 다 설정해야 하는 이유가 궁금합니다."],
    ["fetch 요청에서 401 처리 방법", "로그인이 필요한 API에서 401이 올 때 프론트에서 로그인 페이지로 보내는 방식이 괜찮을까요?"],
    ["게시글 삭제 cascade 확인 방법", "게시글을 삭제했을 때 댓글과 좋아요가 같이 지워졌는지 Prisma Studio에서 확인하면 충분할까요?"],
    ["정렬과 검색을 같이 구현할 때", "검색 where 조건과 orderBy를 같이 넣을 때 주의할 점이 있는지 질문드립니다."],
  ],
  info: [
    ["도서관 운영시간 안내", "이번 주 평일 도서관은 평소와 같이 운영하고, 주말에는 일부 열람실만 개방된다고 합니다."],
    ["장학금 신청 일정 공유", "교내 장학금 신청 기간이 얼마 남지 않았습니다. 포털 공지사항에서 제출 서류를 꼭 확인하세요."],
    ["수강정정 기간 확인하세요", "수강정정 기간에는 신청 인원이 빠르게 바뀌니 원하는 강의는 자주 확인하는 게 좋습니다."],
    ["학생상담센터 프로그램 안내", "학기 중 스트레스 관리 프로그램이 열립니다. 관심 있는 분들은 학교 공지에서 신청할 수 있습니다."],
    ["교내 셔틀버스 시간표 변경", "아침 시간 일부 노선 시간이 조정됐다고 합니다. 등교 전에 시간표를 다시 확인하세요."],
    ["프린터 사용 가능한 장소", "중앙도서관과 일부 단과대 건물에서 출력이 가능합니다. 카드 충전 여부도 미리 확인하세요."],
  ],
  market: [
    ["데이터베이스 전공책 판매합니다", "Database System Concepts 전공책 판매합니다. 필기 거의 없고 상태 좋습니다."],
    ["무선 키보드 판매", "수업 필기용으로 쓰던 무선 키보드입니다. 정상 작동하고 박스도 있습니다."],
    ["공학용 계산기 양도합니다", "기사 시험 준비하면서 사용했던 계산기입니다. 필요한 분께 저렴하게 양도합니다."],
    ["노트북 거치대 판매", "높이 조절 가능한 거치대입니다. 도서관에서 사용하기 좋습니다."],
    ["컴퓨터공학 전공책 묶음 판매", "자료구조, 운영체제, 네트워크 책을 한 번에 정리합니다. 개별 판매도 가능합니다."],
    ["텀블러 새 제품 판매", "선물로 받았는데 사용하지 않아 판매합니다. 포장 그대로입니다."],
  ],
  lost: [
    ["학생증을 분실했습니다", "오늘 오후 중앙도서관 근처에서 학생증을 잃어버렸습니다. 발견하신 분은 댓글 부탁드립니다."],
    ["에어팟 케이스 습득", "사림관 1층 복도에서 에어팟 케이스를 주웠습니다. 색상과 특징을 알려주시면 전달드리겠습니다."],
    ["검은색 지갑 찾습니다", "학생회관 근처에서 검은색 지갑을 분실했습니다. 안에 학생증이 들어 있습니다."],
    ["강의실에 충전기를 두고 왔어요", "공대 3호관 강의실에 노트북 충전기를 두고 나온 것 같습니다. 보신 분 계실까요?"],
    ["파란색 우산 습득했습니다", "도서관 입구 우산꽂이 옆에 있던 파란색 우산을 맡겨두었습니다."],
    ["분홍색 필통 찾습니다", "오전 수업 후 필통이 없어졌습니다. 경영대 강의실에서 보신 분은 알려주세요."],
  ],
};

const commentTemplates = [
  "정보 감사합니다. 참고하겠습니다.",
  "저도 궁금했던 내용인데 도움이 됐어요.",
  "혹시 자세한 위치도 알 수 있을까요?",
  "오늘 확인해보니 아직 가능했습니다.",
  "저도 비슷한 경험이 있습니다.",
  "좋은 글 감사합니다.",
  "필요하면 같이 확인해드릴게요.",
  "공지사항도 같이 보는 게 좋을 것 같습니다.",
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
