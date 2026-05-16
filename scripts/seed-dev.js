require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PASSWORD = "test1234!";
const SALT_ROUNDS = 12;
const BASE_DATE = new Date("2026-05-16T12:00:00+09:00");

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
  { email: "algorithm@cwnu.ac.kr", nickname: "알고리즘장인" },
  { email: "library@cwnu.ac.kr", nickname: "새벽도서관" },
  { email: "potato@cwnu.ac.kr", nickname: "코딩하는감자" },
  { email: "campuscat@cwnu.ac.kr", nickname: "캠퍼스고양이" },
  { email: "dbmaster@cwnu.ac.kr", nickname: "DB마스터" },
  { email: "assignment@cwnu.ac.kr", nickname: "과제폭격기" },
  { email: "hello543@cwnu.ac.kr", nickname: "hello543" },
  { email: "quietroom@cwnu.ac.kr", nickname: "조용한열람실" },
  { email: "bughunter@cwnu.ac.kr", nickname: "버그잡는참새" },
  { email: "frontend@cwnu.ac.kr", nickname: "프론트는어려워" },
];

const postSeeds = {
  notice: [
    {
      title: "CWNU Community 이용 안내",
      content:
        "학내 구성원이 자유롭게 소통할 수 있도록 만든 커뮤니티 게시판입니다. 욕설, 비방, 개인정보 노출은 피하고 서로에게 도움이 되는 글을 남겨주세요.",
      viewCount: 286,
    },
    {
      title: "개인정보가 포함된 게시글 작성 주의",
      content:
        "학생증 번호, 전화번호, 계좌번호 등 민감한 정보는 게시글이나 댓글에 직접 작성하지 않는 것을 권장합니다. 필요한 경우 개인적으로 확인해 주세요.",
      viewCount: 244,
    },
    {
      title: "모바일 화면 최적화 적용 안내",
      content:
        "모바일 환경에서도 게시판 바로가기, 검색 필터, 게시글 목록, 마이페이지를 편하게 볼 수 있도록 반응형 UI를 보완했습니다.",
      viewCount: 232,
    },
    {
      title: "DB 과제 시연용 테스트 데이터 안내",
      content:
        "현재 게시글과 댓글은 개발용 seed 스크립트로 생성된 시연용 데이터입니다. 실제 사용자 개인정보는 포함되어 있지 않습니다.",
      viewCount: 268,
    },
    {
      title: "중고장터와 분실물 게시판 이용 방법",
      content:
        "중고장터와 분실물은 별도 서비스가 아니라 일반 게시글 카테고리로 운영됩니다. 거래 위치와 발견 장소는 구체적으로 작성해 주세요.",
      viewCount: 219,
    },
    {
      title: "서버 점검 및 배포 확인 공지",
      content:
        "Vercel 배포 환경에서 API 라우팅, 로그인 쿠키, 게시글 작성, 댓글과 반응 기능을 점검했습니다. 이상이 있으면 질문게시판에 남겨주세요.",
      viewCount: 251,
    },
  ],
  free: [
    {
      title: "오늘 학식 돈가스 괜찮았나요?",
      content:
        "점심시간에 사람이 많아서 그냥 나왔는데 사진 보니까 괜찮아 보이더라고요. 먹어본 분들 후기 부탁드립니다.",
    },
    {
      title: "도서관 자리 잡기 가장 좋은 시간대",
      content:
        "시험기간이 다가오니 도서관 자리가 빨리 차네요. 요즘은 아침 8시 반 전에 가야 창가 자리가 조금 남아 있는 것 같습니다.",
    },
    {
      title: "비 오는 날 캠퍼스 산책 생각보다 좋네요",
      content:
        "우산 쓰고 공대에서 중앙도서관까지 걸었는데 조용해서 좋았습니다. 다만 경사길은 미끄러우니 조심하세요.",
      isAnonymous: true,
    },
    {
      title: "과제 마감 전날의 집중력은 왜 항상 최고일까요",
      content:
        "분명 일주일 전부터 하려고 했는데 결국 마감 전날에 가장 빠르게 진행됩니다. 다음 과제는 정말 미리 시작해 보려고 합니다.",
    },
    {
      title: "캠퍼스 고양이 오늘 봤습니다",
      content:
        "학생회관 근처에서 회색 고양이를 봤습니다. 사람을 무서워하지 않던데, 간식은 함부로 주지 않는 게 좋겠죠?",
    },
    {
      title: "축제 때 같이 부스 구경할 사람 있나요?",
      content:
        "수업 끝나고 저녁에 축제 부스 둘러보려고 합니다. 혼자 가기 애매한 분 있으면 같이 가요.",
      isAnonymous: true,
    },
  ],
  study: [
    {
      title: "DB 정규화 1NF, 2NF, 3NF 정리",
      content:
        "1NF는 반복 그룹 제거, 2NF는 부분 함수 종속 제거, 3NF는 이행 함수 종속 제거로 정리하면 시험 문제를 풀 때 훨씬 편했습니다.",
      viewCount: 248,
    },
    {
      title: "Node.js Express 라우터 구조 잡는 법",
      content:
        "controller와 route를 분리하니 기능이 늘어나도 관리하기 쉬웠습니다. 특히 인증 미들웨어를 라우트에서 명확히 붙이는 방식이 좋았습니다.",
    },
    {
      title: "Prisma relation 이해한 방식 공유",
      content:
        "관계 필드는 JavaScript에서 include/select로 접근하는 통로이고, 실제 FK는 relation fields에 지정된 컬럼이라고 생각하니 이해가 쉬웠습니다.",
    },
    {
      title: "SQL JOIN 문제 풀 때 기준 테이블 먼저 잡기",
      content:
        "INNER JOIN인지 LEFT JOIN인지 헷갈릴 때는 결과에 반드시 남아야 하는 테이블이 무엇인지 먼저 정하면 실수가 줄었습니다.",
    },
    {
      title: "Vercel 배포하면서 배운 점",
      content:
        "로컬 Express 서버와 서버리스 환경은 다르게 생각해야 했습니다. api/index.js와 vercel.json rewrite 설정이 핵심이었습니다.",
      viewCount: 239,
    },
    {
      title: "시험기간 공부 루틴 공유합니다",
      content:
        "오전에는 이론 정리, 오후에는 문제 풀이, 밤에는 코드 실습을 하니 과목이 섞여도 덜 지쳤습니다. 잠은 줄이지 않는 게 중요했습니다.",
    },
  ],
  question: [
    {
      title: "로그인 후 /api/auth/me가 401처럼 보일 때",
      content:
        "로그인은 성공했는데 새로고침 후 인증 상태가 풀리는 경우 cookie 설정을 먼저 보면 될까요? SameSite와 secure 옵션이 헷갈립니다.",
    },
    {
      title: "COOKIE_SECURE는 배포에서 true로 두면 되나요?",
      content:
        "로컬에서는 false, Vercel HTTPS 환경에서는 true로 사용하는 방향으로 이해했습니다. 혹시 주의해야 할 점이 더 있을까요?",
    },
    {
      title: "Prisma migration과 Neon DIRECT_URL 질문",
      content:
        "DATABASE_URL과 DIRECT_URL을 나눠 쓰는 이유를 정리 중입니다. pooled connection과 direct connection 차이를 설명할 때 어떤 식이 좋을까요?",
    },
    {
      title: "cascade 삭제 검증은 어떤 화면을 캡처하면 좋을까요?",
      content:
        "게시글 삭제 후 댓글, 좋아요, 북마크가 같이 사라졌다는 걸 기능 설명서에 넣으려면 Prisma Studio 화면이 가장 명확할까요?",
      viewCount: 202,
    },
    {
      title: "댓글순 정렬은 _count로 처리하는 게 맞나요?",
      content:
        "댓글과 답글을 모두 합산해서 정렬하려고 합니다. Prisma에서 count 기준 정렬을 적용할 때 놓치기 쉬운 부분이 있는지 궁금합니다.",
    },
    {
      title: "답글의 답글을 막는 서버 검증 방식",
      content:
        "프론트에서 버튼을 숨기는 것 외에 서버에서 parent 댓글의 parentId가 null인지 검사하면 충분한지 확인하고 싶습니다.",
    },
  ],
  info: [
    {
      title: "중앙도서관 시험기간 운영시간 확인",
      content:
        "시험기간에는 열람실 운영시간이 일부 연장된다고 합니다. 정확한 시간은 도서관 공지와 현장 안내문을 함께 확인해 주세요.",
      viewCount: 205,
    },
    {
      title: "셔틀버스 시간표가 일부 변경됐습니다",
      content:
        "아침 시간대 셔틀버스 배차가 조금 조정된 것 같습니다. 첫 수업이 있는 분들은 전날 시간표를 한 번 더 확인하는 게 좋겠습니다.",
    },
    {
      title: "프린터 사용 가능한 위치 정리",
      content:
        "중앙도서관, 공대 일부 건물, 학생회관에서 출력이 가능합니다. 파일 형식과 잔액 충전 여부를 미리 확인하세요.",
    },
    {
      title: "장학금 신청 일정 놓치지 마세요",
      content:
        "교내 장학금 신청 기간이 곧 마감됩니다. 성적증명서와 통장 사본이 필요한 경우가 있으니 미리 준비해 두면 좋습니다.",
    },
    {
      title: "상담센터 프로그램 신청 안내",
      content:
        "시험 스트레스 관리 프로그램이 열려 있습니다. 혼자 버티기 힘든 시기에는 이런 프로그램을 활용해 보는 것도 좋습니다.",
    },
    {
      title: "공대 건물 콘센트 많은 강의실",
      content:
        "노트북 충전이 필요한 분들은 공대 3호관 일부 강의실을 확인해 보세요. 다만 수업 중인 강의실 사용은 피하는 게 좋습니다.",
    },
  ],
  market: [
    {
      title: "데이터베이스 전공책 판매합니다",
      content:
        "Database System Concepts 교재 판매합니다. 필기는 조금 있지만 과제와 시험 준비에 참고하기 좋았습니다. 공대 앞 거래 가능합니다.",
    },
    {
      title: "무선 키보드 조용한 모델 양도",
      content:
        "도서관에서 사용하기 좋은 저소음 무선 키보드입니다. 박스 있고 배터리 상태도 괜찮습니다.",
    },
    {
      title: "공학용 계산기 판매합니다",
      content:
        "기사 시험 준비하면서 사용한 공학용 계산기입니다. 기능 정상이고 버튼 눌림 문제 없습니다.",
    },
    {
      title: "노트북 거치대 저렴하게 양도",
      content:
        "가방에 넣고 다니기 좋은 접이식 거치대입니다. 장시간 코딩할 때 목이 덜 아파서 유용했습니다.",
    },
    {
      title: "24인치 모니터 판매합니다",
      content:
        "기숙사에서 사용하던 24인치 모니터입니다. HDMI 케이블 포함이고 화면 번짐은 없습니다.",
    },
    {
      title: "컴퓨터공학 전공책 묶음 정리",
      content:
        "자료구조, 운영체제, 네트워크 교재를 정리합니다. 묶음 우선이고 필요하면 개별 판매도 가능합니다.",
    },
  ],
  lost: [
    {
      title: "학생증을 찾습니다",
      content:
        "오늘 오후 중앙도서관 근처에서 학생증을 잃어버렸습니다. 이름 일부와 학번 뒷자리를 확인하고 받을 수 있게 연락 부탁드립니다.",
    },
    {
      title: "검정색 우산 분실했습니다",
      content:
        "공대 2호관 입구 우산꽂이에 검정색 장우산을 두고 온 것 같습니다. 비슷한 우산을 보신 분은 댓글 부탁드립니다.",
    },
    {
      title: "노트북 충전기 두고 온 것 같아요",
      content:
        "공대 3층 강의실에 노트북 충전기를 놓고 나온 것 같습니다. 혹시 보관 중인 분 계실까요?",
      isAnonymous: true,
    },
    {
      title: "에어팟 케이스 습득했습니다",
      content:
        "도서관 1층 복도에서 에어팟 케이스를 주웠습니다. 색상과 스티커 특징을 알려주시면 전달드리겠습니다.",
    },
    {
      title: "파란색 필통 찾습니다",
      content:
        "전공 수업 후 필통이 없어졌습니다. 경영대 강의실이나 복도에서 보신 분이 있으면 알려주세요.",
    },
    {
      title: "학생회관 근처 지갑 분실",
      content:
        "학생회관 근처에서 검정색 지갑을 잃어버렸습니다. 카드와 학생증이 들어 있어 급하게 찾고 있습니다.",
    },
  ],
};

const commentsByCategory = {
  notice: [
    "공지 확인했습니다. 개인정보 관련 안내는 캡처해서 친구들에게도 공유할게요.",
    "시연용 데이터라는 점이 명확해서 과제 설명할 때 좋을 것 같습니다.",
    "모바일 화면 안내가 있어서 휴대폰으로 확인하기 편했습니다.",
    "중고장터와 분실물 이용 기준이 한 번에 정리되어 있네요.",
  ],
  free: [
    "오늘 학식은 생각보다 괜찮았습니다. 다음에는 조금 일찍 가는 걸 추천해요.",
    "도서관은 아침 일찍 가야 확실히 자리가 있더라고요.",
    "캠퍼스 고양이는 봐도 간식은 조심하는 게 좋을 것 같습니다.",
    "과제 마감 전 집중력 이야기는 너무 공감됩니다.",
  ],
  study: [
    "정규화 정리 방식이 깔끔해서 시험 전에 다시 보려고 저장했습니다.",
    "Prisma relation 설명이 이해하기 좋네요.",
    "JOIN 문제 풀 때 기준 테이블 잡는 팁 도움이 됩니다.",
    "Vercel 배포 부분은 저도 정리 중이라 참고하겠습니다.",
  ],
  question: [
    "저도 같은 문제 겪었는데 cookie secure 옵션을 먼저 확인했습니다.",
    "Prisma Studio 화면을 같이 캡처하면 설명하기 좋을 것 같아요.",
    "서버 검증까지 넣어야 안전하다는 점이 중요해 보입니다.",
    "DIRECT_URL은 migration 설명에서 따로 언급하면 좋겠습니다.",
  ],
  info: [
    "정보 감사합니다. 시험기간 운영시간은 매번 헷갈렸는데 도움이 됩니다.",
    "프린터 위치 정리 유용하네요.",
    "셔틀버스 시간표는 전날 꼭 확인해야겠습니다.",
    "상담센터 프로그램도 과제 기간에 도움이 될 것 같습니다.",
  ],
  market: [
    "아직 판매 중이면 상태 사진도 볼 수 있을까요?",
    "공대 앞 거래 가능하면 편할 것 같습니다.",
    "가격이 괜찮으면 관심 있습니다.",
    "박스나 구성품이 있는지 알려주세요.",
  ],
  lost: [
    "분실물 센터에도 같이 문의해 보세요.",
    "비슷한 물건을 보면 댓글 남기겠습니다.",
    "장소와 시간을 구체적으로 써주셔서 찾기 쉬울 것 같아요.",
    "찾으면 글 제목에 해결 표시해 주시면 좋겠습니다.",
  ],
};

const replyTemplates = [
  "확인해 주셔서 감사합니다. 내용 조금 더 보완해 둘게요.",
  "맞아요. 저도 같은 방식으로 처리했습니다.",
  "좋은 의견입니다. 다음에 글 수정할 때 반영하겠습니다.",
  "정보 감사합니다. 덕분에 바로 확인했습니다.",
  "필요하면 관련 링크도 댓글로 추가해 보겠습니다.",
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

const random = createRandom(20260516);

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randomInt(0, items.length - 1)];
}

function daysAgo(days, hour = 9, minute = 0) {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function makePostDates(index) {
  const createdAt = daysAgo(randomInt(0, 9), 8 + (index % 9), randomInt(0, 55));

  if (index % 4 === 0) {
    return { createdAt, updatedAt: createdAt };
  }

  return {
    createdAt,
    updatedAt: new Date(createdAt.getTime() + randomInt(2, 36) * 60 * 60 * 1000),
  };
}

function makeChildDate(parentDate, index) {
  return new Date(parentDate.getTime() + (index + 1) * randomInt(20, 130) * 60 * 1000);
}

function getPostViewCount(category, postIndex, seed) {
  if (typeof seed.viewCount === "number") return seed.viewCount;
  const baseByCategory = {
    notice: [160, 280],
    study: [55, 220],
    question: [35, 170],
    info: [40, 185],
    free: [20, 160],
    market: [18, 145],
    lost: [25, 155],
  };
  const [min, max] = baseByCategory[category] || [0, 150];
  return Math.min(300, randomInt(min, max) + (postIndex % 5 === 0 ? randomInt(30, 70) : 0));
}

async function resetData(tx) {
  await tx.bookmark.deleteMany();
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

  for (const [category, seeds] of Object.entries(postSeeds)) {
    for (const seed of seeds) {
      const author = createdUsers[postIndex % createdUsers.length];
      const { createdAt, updatedAt } = makePostDates(postIndex);

      createdPosts.push(
        await tx.post.create({
          data: {
            category,
            title: seed.title,
            content: seed.content,
            isAnonymous: seed.isAnonymous ?? postIndex % 7 === 3,
            viewCount: getPostViewCount(category, postIndex, seed),
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
  let commentCount = 0;
  let replyCount = 0;

  for (const post of createdPosts) {
    const templates = commentsByCategory[post.category] || commentsByCategory.free;
    const topLevelCount = randomInt(0, 5);
    const topLevelComments = [];

    for (let index = 0; index < topLevelCount; index += 1) {
      const author = createdUsers[(post.id + index * 2) % createdUsers.length];
      const createdAt = makeChildDate(post.createdAt, index);
      const edited = index % 4 === 2;

      const comment = await tx.comment.create({
        data: {
          postId: post.id,
          userId: author.id,
          content: templates[index % templates.length],
          isAnonymous: (post.id + index) % 5 === 0,
          createdAt,
          updatedAt: edited ? makeChildDate(createdAt, 1) : createdAt,
        },
      });

      topLevelComments.push(comment);
      commentCount += 1;
    }

    const repliesToCreate = topLevelComments.slice(0, randomInt(0, Math.min(2, topLevelComments.length)));

    for (let index = 0; index < repliesToCreate.length; index += 1) {
      const parent = repliesToCreate[index];
      const author = createdUsers[(parent.id + index + 3) % createdUsers.length];
      const createdAt = makeChildDate(parent.createdAt, index);

      await tx.comment.create({
        data: {
          postId: post.id,
          userId: author.id,
          parentId: parent.id,
          content: replyTemplates[(post.id + index) % replyTemplates.length],
          isAnonymous: (post.id + parent.id + index) % 4 === 0,
          createdAt,
          updatedAt: createdAt,
        },
      });

      replyCount += 1;
    }
  }

  return { commentCount, replyCount };
}

async function seedReactions(tx, createdUsers, createdPosts) {
  let likeCount = 0;
  let dislikeCount = 0;
  let bookmarkCount = 0;

  for (let postIndex = 0; postIndex < createdPosts.length; postIndex += 1) {
    const post = createdPosts[postIndex];
    const hotBoost = post.category === "notice" || post.viewCount >= 220 ? 2 : 0;
    const maxLikes = Math.min(createdUsers.length, randomInt(2, 7) + hotBoost);
    const usedReactionUsers = new Set();

    for (let index = 0; index < maxLikes; index += 1) {
      const user = createdUsers[(postIndex + index) % createdUsers.length];
      usedReactionUsers.add(user.id);

      await tx.like.create({
        data: {
          postId: post.id,
          userId: user.id,
          createdAt: makeChildDate(post.createdAt, index),
        },
      });
      likeCount += 1;
    }

    const dislikeCandidates = createdUsers.filter((user) => !usedReactionUsers.has(user.id));
    const maxDislikes = post.category === "notice" ? randomInt(0, 1) : randomInt(0, Math.min(2, dislikeCandidates.length));

    for (let index = 0; index < maxDislikes; index += 1) {
      const user = dislikeCandidates[index];
      await tx.dislike.create({
        data: {
          postId: post.id,
          userId: user.id,
          createdAt: makeChildDate(post.createdAt, index + 2),
        },
      });
      dislikeCount += 1;
    }

    const maxBookmarks = Math.min(createdUsers.length, randomInt(1, 4) + (post.category === "study" ? 1 : 0));

    for (let index = 0; index < maxBookmarks; index += 1) {
      const user = createdUsers[(postIndex + index + 4) % createdUsers.length];
      await tx.bookmark.create({
        data: {
          postId: post.id,
          userId: user.id,
          createdAt: makeChildDate(post.createdAt, index + 3),
        },
      });
      bookmarkCount += 1;
    }
  }

  return { likeCount, dislikeCount, bookmarkCount };
}

function countPostsByCategory(posts) {
  return Object.keys(CATEGORY_LABELS).reduce((counts, category) => {
    counts[category] = posts.filter((post) => post.category === category).length;
    return counts;
  }, {});
}

async function main() {
  assertSafeToRun();

  console.log("기존 개발 데이터가 삭제되고 새 seed 데이터로 교체됩니다.");

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
        comments: comments.commentCount,
        replies: comments.replyCount,
        likes: reactions.likeCount,
        dislikes: reactions.dislikeCount,
        bookmarks: reactions.bookmarkCount,
        postsByCategory: countPostsByCategory(createdPosts),
        accounts: users.map((user) => ({
          email: user.email,
          nickname: user.nickname,
        })),
      };
    },
    {
      timeout: 60000,
    }
  );

  console.log("Development seed completed.");
  console.log(`All test account passwords: ${PASSWORD}`);
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
