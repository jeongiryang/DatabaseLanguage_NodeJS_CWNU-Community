require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PASSWORD = "test1234!";
const SALT_ROUNDS = 12;
const BASE_DATE = new Date("2026-05-23T15:00:00+09:00");
const DEMO_USER_KEY = "assignment";

const CATEGORY_LABELS = {
  notice: "공지사항",
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const USER_SEEDS = [
  { key: "algorithm", email: "algorithm@cwnu.ac.kr", nickname: "알고리즘장인" },
  { key: "library", email: "library@cwnu.ac.kr", nickname: "새벽도서관" },
  { key: "potato", email: "potato@cwnu.ac.kr", nickname: "코딩하는감자" },
  { key: "campuscat", email: "campuscat@cwnu.ac.kr", nickname: "캠퍼스고양이" },
  { key: "dbmaster", email: "dbmaster@cwnu.ac.kr", nickname: "DB마스터" },
  { key: "assignment", email: "assignment@cwnu.ac.kr", nickname: "과제폭격기" },
  { key: "hello543", email: "hello543@cwnu.ac.kr", nickname: "hello543" },
  { key: "quietroom", email: "quietroom@cwnu.ac.kr", nickname: "조용한열람실" },
  { key: "sparrow", email: "sparrow@cwnu.ac.kr", nickname: "버그잡는참새" },
  { key: "frontend", email: "frontend@cwnu.ac.kr", nickname: "프론트는어려워" },
];

const POST_SEEDS = {
  notice: [
    {
      title: "CWNU Community 이용 안내",
      content:
        "CWNU Community는 학내 구성원이 게시글, 댓글, 반응 기능을 안전하게 확인할 수 있도록 구성한 데이터베이스개론 과제용 커뮤니티 게시판입니다. 서로에게 도움이 되는 정보와 질문을 남겨주세요.",
      authorKey: "dbmaster",
      daysAgo: 10,
      time: [9, 10],
      viewCount: 318,
      likeTarget: 5,
      bookmarkTarget: 3,
      commentTarget: 3,
      replyTarget: 1,
      editHours: 20,
    },
    {
      title: "개인정보 포함 게시글 작성 주의",
      content:
        "학생증 번호, 전화번호, 계좌번호, 개인 연락처처럼 민감한 정보는 게시글과 댓글에 직접 작성하지 않아야 합니다. 거래나 분실물 확인은 공개 정보가 아닌 개인 연락으로 마무리해 주세요.",
      authorKey: "library",
      daysAgo: 9,
      time: [10, 0],
      viewCount: 280,
      likeTarget: 4,
      dislikeTarget: 0,
      bookmarkTarget: 4,
      commentTarget: 2,
      editHours: 12,
    },
    {
      title: "모바일 화면 최적화 안내",
      content:
        "모바일 화면에서 헤더, 게시판 바로가기, 검색 필터, 카드형 게시글 목록, 마이페이지 대시보드가 자연스럽게 보이도록 UI를 정리했습니다. 360px 화면에서도 주요 기능을 확인할 수 있습니다.",
      authorKey: "frontend",
      daysAgo: 7,
      time: [13, 20],
      viewCount: 260,
      likeTarget: 5,
      bookmarkTarget: 4,
      commentTarget: 3,
    },
    {
      title: "글쓰기 가이드와 임시저장 기능 안내",
      content:
        "글쓰기 화면에서는 카테고리별 작성 가이드, 글자 수 카운터, 미리보기, localStorage 임시저장을 제공합니다. 새 글 작성 중 실수로 이동해도 작성 내용을 다시 확인할 수 있습니다.",
      authorKey: "assignment",
      daysAgo: 5,
      time: [11, 30],
      viewCount: 238,
      likeTarget: 4,
      bookmarkTarget: 4,
      commentTarget: 3,
      editHours: 8,
    },
    {
      title: "서버 점검 및 Vercel 배포 확인 공지",
      content:
        "Vercel 배포 환경에서 /api/health, 로그인, 게시글 작성, 댓글, 좋아요, 싫어요, 북마크 흐름을 확인했습니다. 배포 상태에 이상이 있으면 질문게시판에 현상과 재현 방법을 남겨주세요.",
      authorKey: "dbmaster",
      daysAgo: 4,
      time: [16, 10],
      viewCount: 292,
      likeTarget: 5,
      bookmarkTarget: 5,
      commentTarget: 4,
      editHours: 5,
    },
    {
      title: "게시판 이용 매너 안내",
      content:
        "질문에는 시도한 방법과 오류 메시지를 함께 적고, 중고장터와 분실물 글에는 장소와 시간을 구체적으로 남겨주세요. 익명 기능은 편의를 위한 기능이며 비방 용도로 사용하지 않습니다.",
      authorKey: "quietroom",
      daysAgo: 2,
      time: [9, 40],
      viewCount: 210,
      likeTarget: 4,
      bookmarkTarget: 2,
      commentTarget: 2,
    },
    {
      title: "v1.2.0 시연 데이터 구성 안내",
      content:
        "현재 데이터는 메인 대시보드, 인기글 TOP 3, 검색 하이라이트, 게시글 상세 추천, 마이페이지 활동 시각화가 잘 보이도록 재구성한 시연용 seed 데이터입니다.",
      authorKey: "assignment",
      daysAgo: 0,
      time: [9, 20],
      viewCount: 178,
      likeTarget: 4,
      bookmarkTarget: 3,
      commentTarget: 2,
      editHours: 1,
    },
  ],
  free: [
    {
      title: "오늘 저녁 롤 할 사람 구합니다",
      content:
        "과제 제출 전에 잠깐 머리 식힐 겸 롤 일반전 같이 하실 분 있나요? 실력보다 분위기 좋게 하는 분이면 좋겠습니다. 끝나고 다시 DB 과제 마무리하러 갑니다.",
      authorKey: "hello543",
      daysAgo: 0,
      time: [12, 10],
      viewCount: 486,
      likeTarget: 9,
      dislikeTarget: 1,
      bookmarkTarget: 4,
      commentTarget: 5,
      replyTarget: 2,
    },
    {
      title: "학식 돈가스 오늘은 괜찮았나요?",
      content:
        "점심시간 줄이 길어서 그냥 나왔는데 사진으로 보니까 괜찮아 보였습니다. 먹어본 분들 있으면 후기 부탁드립니다.",
      authorKey: "potato",
      daysAgo: 1,
      time: [12, 30],
      viewCount: 176,
      likeTarget: 5,
      bookmarkTarget: 1,
      commentTarget: 4,
    },
    {
      title: "캠퍼스 고양이 오늘 도서관 앞에 있었습니다",
      content:
        "도서관 앞 벤치 근처에서 회색 고양이를 봤습니다. 사진 찍는 분들이 많았는데 간식은 조심해서 주는 게 좋을 것 같습니다.",
      authorKey: "campuscat",
      daysAgo: 1,
      time: [16, 20],
      viewCount: 232,
      likeTarget: 7,
      bookmarkTarget: 2,
      commentTarget: 4,
    },
    {
      title: "비 오는 날 캠퍼스 산책 생각보다 좋네요",
      content:
        "공학관에서 중앙도서관까지 걸었는데 사람이 적어서 조용했습니다. 대신 경사길은 미끄러워서 조심해야 합니다.",
      authorKey: "quietroom",
      daysAgo: 3,
      time: [18, 5],
      viewCount: 128,
      likeTarget: 3,
      dislikeTarget: 1,
      commentTarget: 2,
      isAnonymous: true,
    },
    {
      title: "축제 부스 같이 구경할 사람 있나요",
      content:
        "수업 끝나고 저녁쯤 축제 부스 둘러보려고 합니다. 혼자 가도 되지만 같이 가면 더 재밌을 것 같아서 올려봅니다.",
      authorKey: "frontend",
      daysAgo: 4,
      time: [15, 40],
      viewCount: 154,
      likeTarget: 4,
      bookmarkTarget: 1,
      commentTarget: 3,
    },
    {
      title: "과제 마감 전날 집중력은 왜 제일 좋을까요",
      content:
        "분명히 일주일 전에 시작하려고 했는데 결국 마감 전날에 가장 빠르게 진행됩니다. 다음 과제는 꼭 미리 시작해 보겠습니다.",
      authorKey: "assignment",
      daysAgo: 6,
      time: [22, 10],
      viewCount: 201,
      likeTarget: 6,
      dislikeTarget: 1,
      bookmarkTarget: 2,
      commentTarget: 4,
      isAnonymous: true,
      editHours: 3,
    },
    {
      title: "셔틀 기다리면서 듣기 좋은 플레이리스트",
      content:
        "아침 셔틀 기다릴 때 듣기 좋은 노래 추천받습니다. 너무 졸린 곡보다 적당히 텐션 올라가는 곡이면 좋겠습니다.",
      authorKey: "library",
      daysAgo: 8,
      time: [8, 30],
      viewCount: 116,
      likeTarget: 3,
      bookmarkTarget: 2,
      commentTarget: 2,
    },
  ],
  study: [
    {
      title: "Prisma relation 이해한 방식 공유",
      content:
        "Prisma relation은 JS 객체에서 include/select로 연결 데이터를 가져오는 통로라고 생각하니 이해가 쉬웠습니다. 실제 FK 필드와 relation field를 분리해서 보면 migration 파일도 덜 헷갈립니다.",
      authorKey: "assignment",
      daysAgo: 1,
      time: [10, 40],
      viewCount: 462,
      likeTarget: 9,
      dislikeTarget: 0,
      bookmarkTarget: 8,
      commentTarget: 5,
      replyTarget: 2,
      editHours: 4,
    },
    {
      title: "SQL JOIN 문제 풀 때 기준 테이블 먼저 잡기",
      content:
        "INNER JOIN인지 LEFT JOIN인지 헷갈릴 때는 반드시 남아야 하는 데이터가 어느 테이블인지 먼저 정하면 실수가 줄었습니다. 문제의 결과 행 기준을 먼저 보는 게 좋습니다.",
      authorKey: "algorithm",
      daysAgo: 2,
      time: [11, 5],
      viewCount: 344,
      likeTarget: 8,
      bookmarkTarget: 7,
      commentTarget: 5,
      replyTarget: 2,
    },
    {
      title: "DB 정규화 1NF 2NF 3NF 빠르게 정리",
      content:
        "1NF는 반복 그룹 제거, 2NF는 부분 함수 종속 제거, 3NF는 이행 함수 종속 제거로 기억하면 시험 문제를 풀 때 정리하기 쉬웠습니다.",
      authorKey: "dbmaster",
      daysAgo: 3,
      time: [13, 15],
      viewCount: 286,
      likeTarget: 7,
      bookmarkTarget: 7,
      commentTarget: 4,
    },
    {
      title: "Node.js Express 라우터 구조 잡는 방법",
      content:
        "route, controller, middleware를 나누면 기능이 많아져도 관리하기 쉬웠습니다. 인증 미들웨어는 routes에서 명확하게 붙이는 방식이 읽기 좋았습니다.",
      authorKey: "frontend",
      daysAgo: 5,
      time: [19, 0],
      viewCount: 210,
      likeTarget: 5,
      bookmarkTarget: 5,
      commentTarget: 3,
      editHours: 6,
    },
    {
      title: "Vercel 배포하면서 배운 점",
      content:
        "로컬 Express 서버와 Vercel 서버리스 환경은 다르게 생각해야 했습니다. api/index.js에서 app을 export하고 vercel.json rewrite를 설정하는 흐름이 핵심이었습니다.",
      authorKey: "sparrow",
      daysAgo: 6,
      time: [17, 25],
      viewCount: 238,
      likeTarget: 6,
      bookmarkTarget: 6,
      commentTarget: 4,
    },
    {
      title: "시험 기간 공부 루틴 공유합니다",
      content:
        "오전에는 이론 정리, 오후에는 문제 풀이, 밤에는 코드 실습을 나누니 과목이 섞이지 않아 좋았습니다. 쉬는 시간도 일정에 넣는 편이 오래 버티기 좋았습니다.",
      authorKey: "quietroom",
      daysAgo: 7,
      time: [20, 0],
      viewCount: 172,
      likeTarget: 4,
      bookmarkTarget: 4,
      commentTarget: 2,
    },
    {
      title: "ERD 그릴 때 관계 이름까지 적어두면 편합니다",
      content:
        "User와 Post처럼 익숙한 관계도 역할 이름을 써두면 나중에 Prisma schema로 옮길 때 실수가 줄었습니다. 특히 self relation은 이름을 명확히 잡는 게 좋습니다.",
      authorKey: "library",
      daysAgo: 9,
      time: [14, 20],
      viewCount: 148,
      likeTarget: 4,
      bookmarkTarget: 5,
      commentTarget: 2,
    },
  ],
  question: [
    {
      title: "Vercel 배포 후 로그인 401이 뜰 때 어디부터 봐야 하나요",
      content:
        "로컬에서는 로그인 유지가 되는데 배포 후 /api/auth/me가 401처럼 보이는 상황이 있습니다. cookie secure, sameSite, 도메인 설정 중 어디를 먼저 확인하는 게 좋을까요?",
      authorKey: "frontend",
      daysAgo: 0,
      time: [11, 40],
      viewCount: 438,
      likeTarget: 8,
      dislikeTarget: 1,
      bookmarkTarget: 6,
      commentTarget: 5,
      replyTarget: 2,
    },
    {
      title: "COOKIE_SECURE는 배포에서 true로 두면 되나요",
      content:
        "로컬에서는 false, Vercel HTTPS 환경에서는 true로 사용하는 방향으로 이해했습니다. 혹시 개발 환경과 배포 환경을 나눌 때 주의해야 할 점이 있을까요?",
      authorKey: "potato",
      daysAgo: 2,
      time: [9, 50],
      viewCount: 214,
      likeTarget: 5,
      bookmarkTarget: 4,
      commentTarget: 4,
    },
    {
      title: "Prisma migration과 Neon DIRECT_URL 질문",
      content:
        "DATABASE_URL과 DIRECT_URL을 나누는 이유를 정리 중입니다. pooled connection과 direct connection 차이를 README에 어떻게 적으면 이해하기 좋을까요?",
      authorKey: "dbmaster",
      daysAgo: 3,
      time: [15, 35],
      viewCount: 250,
      likeTarget: 6,
      bookmarkTarget: 6,
      commentTarget: 4,
      editHours: 2,
    },
    {
      title: "cascade 삭제 검증은 어떤 화면으로 보여주면 좋을까요",
      content:
        "게시글 삭제 후 댓글, 좋아요, 북마크가 같이 사라진다는 걸 기능 설명서에 넣으려면 Prisma Studio 화면과 삭제 전후 API 응답 중 어떤 방식이 더 명확할까요?",
      authorKey: "assignment",
      daysAgo: 4,
      time: [13, 5],
      viewCount: 231,
      likeTarget: 6,
      bookmarkTarget: 5,
      commentTarget: 4,
    },
    {
      title: "댓글순 정렬은 _count 기준으로 처리하는 게 맞나요",
      content:
        "댓글과 답글을 모두 합산해서 정렬하려고 합니다. Prisma에서 comments _count 기준 정렬을 쓰면 답글까지 포함되는지 확인하고 있습니다.",
      authorKey: "algorithm",
      daysAgo: 5,
      time: [10, 30],
      viewCount: 184,
      likeTarget: 4,
      bookmarkTarget: 3,
      commentTarget: 3,
    },
    {
      title: "좋아요와 북마크를 동시에 눌러도 괜찮나요",
      content:
        "좋아요와 싫어요는 상호 전환으로 처리했는데 북마크는 별도 저장으로 두었습니다. UX 관점에서 같은 글을 좋아요하고 북마크하는 흐름이 자연스러운지 궁금합니다.",
      authorKey: "hello543",
      daysAgo: 6,
      time: [16, 45],
      viewCount: 152,
      likeTarget: 3,
      dislikeTarget: 1,
      bookmarkTarget: 4,
      commentTarget: 2,
      isAnonymous: true,
    },
    {
      title: "검색과 정렬 query를 같이 유지하는 방법",
      content:
        "검색어가 있을 때 정렬이나 표시 개수를 바꿔도 q가 유지되게 처리하고 싶습니다. URLSearchParams로 관리하는 방식이 가장 안전할까요?",
      authorKey: "sparrow",
      daysAgo: 8,
      time: [18, 20],
      viewCount: 135,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 2,
    },
  ],
  info: [
    {
      title: "셔틀버스 시간표 변경 확인하세요",
      content:
        "이번 주부터 아침 셔틀 일부 시간이 조정된 것으로 보입니다. 첫 수업이 있는 분들은 전날 학교 공지와 정류장 안내문을 같이 확인하는 편이 안전합니다.",
      authorKey: "library",
      daysAgo: 0,
      time: [8, 55],
      viewCount: 394,
      likeTarget: 8,
      bookmarkTarget: 7,
      commentTarget: 4,
      replyTarget: 1,
    },
    {
      title: "중앙도서관 시험 기간 운영시간 정리",
      content:
        "시험 기간에는 열람실 운영시간이 평소와 달라질 수 있습니다. 늦게까지 공부할 예정이면 도서관 공지와 현장 안내문을 먼저 확인해 주세요.",
      authorKey: "quietroom",
      daysAgo: 1,
      time: [9, 30],
      viewCount: 254,
      likeTarget: 6,
      bookmarkTarget: 7,
      commentTarget: 3,
    },
    {
      title: "프린터 사용 가능한 위치 정리",
      content:
        "중앙도서관, 공학관 일부 층, 학생회관에서 출력이 가능합니다. 파일 형식과 잔액 충전 여부를 미리 확인하면 급할 때 덜 당황합니다.",
      authorKey: "hello543",
      daysAgo: 2,
      time: [14, 10],
      viewCount: 218,
      likeTarget: 5,
      bookmarkTarget: 6,
      commentTarget: 3,
    },
    {
      title: "장학금 신청 일정 놓치지 마세요",
      content:
        "교내 장학금 신청 기간이 곧 마감됩니다. 성적증명서와 통장 사본 등 필요한 서류가 있는지 미리 확인해 두면 좋습니다.",
      authorKey: "campuscat",
      daysAgo: 3,
      time: [11, 55],
      viewCount: 242,
      likeTarget: 5,
      bookmarkTarget: 6,
      commentTarget: 3,
    },
    {
      title: "상담센터 프로그램 신청 안내",
      content:
        "시험 스트레스와 진로 고민을 다루는 상담센터 프로그램이 열려 있습니다. 혼자 버티기 힘든 시기에는 학교 프로그램을 활용해 보는 것도 좋습니다.",
      authorKey: "library",
      daysAgo: 5,
      time: [10, 5],
      viewCount: 156,
      likeTarget: 4,
      bookmarkTarget: 4,
      commentTarget: 2,
    },
    {
      title: "공학관 콘센트 많은 강의실 공유",
      content:
        "노트북 충전이 필요한 분들은 공학관 3층 일부 강의실을 확인해 보세요. 다만 수업 중인 강의실 사용은 피하는 게 좋습니다.",
      authorKey: "frontend",
      daysAgo: 6,
      time: [12, 45],
      viewCount: 188,
      likeTarget: 4,
      bookmarkTarget: 5,
      commentTarget: 3,
    },
    {
      title: "학사 일정 캘린더에 미리 넣어두면 편합니다",
      content:
        "수강정정, 휴강 보강, 장학금, 졸업 관련 일정은 한 번에 몰려서 확인하기 어렵습니다. 개인 캘린더에 미리 넣어두면 놓치는 일이 줄어듭니다.",
      authorKey: "dbmaster",
      daysAgo: 8,
      time: [13, 20],
      viewCount: 142,
      likeTarget: 3,
      bookmarkTarget: 4,
      commentTarget: 2,
    },
  ],
  market: [
    {
      title: "중고 데이터베이스 전공책 판매합니다",
      content:
        "Database System Concepts 교재 판매합니다. 필기 흔적은 조금 있지만 과제와 시험 준비에 참고하기 좋습니다. 공학관 근처 거래 가능합니다.",
      authorKey: "dbmaster",
      daysAgo: 0,
      time: [13, 30],
      viewCount: 204,
      likeTarget: 4,
      bookmarkTarget: 5,
      commentTarget: 4,
    },
    {
      title: "무선 키보드 조용한 모델 양도합니다",
      content:
        "도서관에서 사용하기 좋은 저소음 무선 키보드입니다. 박스 있고 배터리 상태도 괜찮습니다. 중고 거래는 학생회관 앞에서 가능합니다.",
      authorKey: "frontend",
      daysAgo: 1,
      time: [17, 40],
      viewCount: 180,
      likeTarget: 4,
      bookmarkTarget: 4,
      commentTarget: 3,
    },
    {
      title: "노트북 거치대 저렴하게 양도",
      content:
        "가방에 넣고 다니기 좋은 접이식 거치대입니다. 장시간 코딩할 때 목이 덜 아파서 유용했습니다.",
      authorKey: "potato",
      daysAgo: 2,
      time: [18, 0],
      viewCount: 132,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 2,
    },
    {
      title: "공학용 계산기 판매합니다",
      content:
        "기사 시험 준비하면서 사용한 공학용 계산기입니다. 기능 정상이고 버튼 눌림 문제 없습니다. 필요하신 분 댓글 주세요.",
      authorKey: "algorithm",
      daysAgo: 4,
      time: [11, 0],
      viewCount: 146,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 2,
    },
    {
      title: "24인치 모니터 중고 판매합니다",
      content:
        "기숙사에서 사용하던 24인치 모니터입니다. HDMI 케이블 포함이고 화면 번짐은 없습니다. 직접 들고 가실 수 있는 분이면 좋겠습니다.",
      authorKey: "hello543",
      daysAgo: 5,
      time: [16, 15],
      viewCount: 170,
      likeTarget: 4,
      bookmarkTarget: 4,
      commentTarget: 3,
    },
    {
      title: "C언어와 DB 책 묶음 정리합니다",
      content:
        "자료구조, C언어, 데이터베이스 책을 정리합니다. 묶음 우선이고 필요하면 개별 판매도 가능합니다.",
      authorKey: "library",
      daysAgo: 7,
      time: [12, 10],
      viewCount: 125,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 2,
    },
    {
      title: "USB 허브 중고로 구합니다",
      content:
        "노트북 포트가 부족해서 USB 허브를 구합니다. 작동만 잘 되면 되고, 공학관이나 도서관 근처에서 거래하고 싶습니다.",
      authorKey: "assignment",
      daysAgo: 9,
      time: [15, 30],
      viewCount: 102,
      likeTarget: 2,
      bookmarkTarget: 3,
      commentTarget: 2,
      isAnonymous: true,
    },
  ],
  lost: [
    {
      title: "분실 학생증 찾습니다",
      content:
        "오늘 오전 중앙도서관 근처에서 학생증을 잃어버렸습니다. 이름 첫 글자와 학번 일부를 확인하고 받을 수 있게 댓글 부탁드립니다.",
      authorKey: "assignment",
      daysAgo: 0,
      time: [10, 15],
      viewCount: 188,
      likeTarget: 4,
      bookmarkTarget: 2,
      commentTarget: 4,
      replyTarget: 1,
      isAnonymous: true,
    },
    {
      title: "검정색 우산 분실했습니다",
      content:
        "공학관 2층 입구 우산꽂이에 검정색 우산을 두고 온 것 같습니다. 비슷한 우산을 보신 분은 댓글 부탁드립니다.",
      authorKey: "quietroom",
      daysAgo: 1,
      time: [18, 30],
      viewCount: 146,
      likeTarget: 3,
      bookmarkTarget: 2,
      commentTarget: 3,
    },
    {
      title: "노트북 충전기 놓고 온 것 같아요",
      content:
        "공학관 3층 강의실에 노트북 충전기를 두고 온 것 같습니다. 혹시 보관 중인 분 계시면 알려주세요.",
      authorKey: "frontend",
      daysAgo: 2,
      time: [16, 35],
      viewCount: 160,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 3,
      isAnonymous: true,
    },
    {
      title: "에어팟 케이스 습득했습니다",
      content:
        "도서관 1층 복도에서 에어팟 케이스를 주웠습니다. 색상과 스티커 특징을 알려주시면 전달하겠습니다.",
      authorKey: "campuscat",
      daysAgo: 3,
      time: [13, 20],
      viewCount: 132,
      likeTarget: 3,
      bookmarkTarget: 2,
      commentTarget: 2,
    },
    {
      title: "파란색 필통 찾습니다",
      content:
        "전공 수업 후 필통이 없어졌습니다. 경영대 강의실이나 복도에서 보신 분이 있으면 알려주세요.",
      authorKey: "potato",
      daysAgo: 5,
      time: [17, 5],
      viewCount: 112,
      likeTarget: 2,
      bookmarkTarget: 2,
      commentTarget: 2,
    },
    {
      title: "USB 분실했습니다",
      content:
        "DB 과제 자료가 들어 있는 USB를 찾고 있습니다. 학생회관 근처에서 잃어버린 것 같고, 발견하시면 꼭 댓글 부탁드립니다.",
      authorKey: "sparrow",
      daysAgo: 6,
      time: [15, 10],
      viewCount: 154,
      likeTarget: 3,
      bookmarkTarget: 3,
      commentTarget: 3,
      editHours: 3,
    },
    {
      title: "텀블러 보신 분 있나요",
      content:
        "중앙도서관 2층 열람실에서 회색 텀블러를 놓고 온 것 같습니다. 스티커가 붙어 있어서 확인 가능합니다.",
      authorKey: "library",
      daysAgo: 8,
      time: [9, 45],
      viewCount: 98,
      likeTarget: 2,
      bookmarkTarget: 2,
      commentTarget: 1,
    },
  ],
};

const COMMENT_TEMPLATES = {
  notice: [
    "공지 확인했습니다. 시연할 때 안내 문구가 있어 설명하기 좋을 것 같습니다.",
    "개인정보 주의 문구는 제출용 문서에도 같이 언급하면 좋겠습니다.",
    "모바일 화면까지 확인했다는 점이 교수님께 보여주기 좋을 것 같습니다.",
    "seed 데이터라는 설명이 명확해서 실제 개인정보로 오해하지 않을 것 같습니다.",
    "배포 확인 공지는 문제 발생 시 재현 경로를 남기기 좋겠네요.",
  ],
  free: [
    "저도 오늘 봤는데 생각보다 괜찮았습니다.",
    "도서관 근처는 사람이 많아서 시간대를 잘 골라야 할 것 같아요.",
    "이 글 분위기 좋네요. 캠퍼스 게시판 느낌이 납니다.",
    "마감 전날 집중력 이야기는 너무 공감됩니다.",
    "같이 갈 사람 찾는 글은 자유게시판에 딱 맞는 것 같습니다.",
  ],
  study: [
    "정리 방식이 깔끔해서 북마크해두고 다시 보겠습니다.",
    "Prisma relation 설명이 이해하기 좋습니다.",
    "SQL JOIN 기준 테이블 먼저 잡는 팁이 도움이 됩니다.",
    "배포 경험은 나중에 포트폴리오 정리할 때도 쓸 수 있겠네요.",
    "시험 루틴은 그대로 따라 해봐도 괜찮을 것 같습니다.",
  ],
  question: [
    "비슷한 문제를 겪었는데 cookie 설정부터 확인하는 게 좋았습니다.",
    "에러 메시지와 시도한 방법을 같이 남기면 답변받기 쉬울 것 같습니다.",
    "Prisma Studio와 API 응답을 같이 확인하면 원인 파악이 빨랐습니다.",
    "배포 환경에서는 HTTPS와 secure cookie를 함께 봐야 합니다.",
    "이 질문은 다른 사람도 자주 볼 것 같아서 북마크했습니다.",
  ],
  info: [
    "정보 공유 감사합니다. 바로 확인해봐야겠습니다.",
    "셔틀 시간은 아침 수업 있는 사람들에게 정말 중요합니다.",
    "프린터 위치 정리는 급할 때 유용하겠네요.",
    "장학금 일정은 놓치기 쉬워서 이런 글이 필요합니다.",
    "운영시간은 변경될 수 있으니 공지도 같이 확인하겠습니다.",
  ],
  market: [
    "아직 거래 가능하면 상태 사진도 볼 수 있을까요?",
    "공학관 근처 거래 가능하면 편할 것 같습니다.",
    "가격이 괜찮으면 관심 있습니다.",
    "박스나 구성품이 있는지 알려주시면 좋겠습니다.",
    "중고장터 카테고리에 잘 맞는 글이네요.",
  ],
  lost: [
    "분실물 센터에도 같이 문의해보세요.",
    "비슷한 물건을 보면 댓글 남기겠습니다.",
    "장소와 시간이 구체적이라 찾기 쉬울 것 같습니다.",
    "찾으면 제목에 해결 표시를 남겨주시면 좋겠습니다.",
    "근처 강의실에도 한 번 확인해보세요.",
  ],
};

const REPLY_TEMPLATES = [
  "확인해주셔서 감사합니다. 내용 조금 더 보완해두겠습니다.",
  "좋은 의견 감사합니다. 같은 방식으로 다시 확인해보겠습니다.",
  "말씀하신 부분 반영해서 다음 글에는 더 구체적으로 적어보겠습니다.",
  "정보 감사합니다. 바로 확인해보겠습니다.",
  "저도 같은 생각입니다. 도움이 됐습니다.",
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

function makeDate(daysAgo, hour = 9, minute = 0) {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date, minutes) {
  const next = new Date(date.getTime() + minutes * 60 * 1000);
  return next > BASE_DATE ? new Date(BASE_DATE.getTime() - 60 * 1000) : next;
}

function addHours(date, hours) {
  return addMinutes(date, hours * 60);
}

function rotateUserKeys(start, count, excludedKeys = []) {
  const keys = USER_SEEDS.map((user) => user.key);
  const excluded = new Set(excludedKeys);
  const result = [];

  for (let offset = 0; result.length < count && offset < keys.length * 2; offset += 1) {
    const key = keys[(start + offset) % keys.length];

    if (!excluded.has(key) && !result.includes(key)) {
      result.push(key);
    }
  }

  return result;
}

function buildReactionKeys(postRecord, type, target, excludedKeys = []) {
  const preferred = postRecord.seed[`${type}Users`] || [];
  const keys = [];

  preferred.forEach((key) => {
    if (!excludedKeys.includes(key) && !keys.includes(key)) {
      keys.push(key);
    }
  });

  if ((type === "like" || type === "bookmark") && !keys.includes(DEMO_USER_KEY) && postRecord.seed.authorKey !== DEMO_USER_KEY) {
    keys.push(DEMO_USER_KEY);
  }

  const rotated = rotateUserKeys(postRecord.sequence + (type === "dislike" ? 5 : 2), target + 3, excludedKeys);

  rotated.forEach((key) => {
    if (!keys.includes(key) && keys.length < target) {
      keys.push(key);
    }
  });

  return keys.slice(0, target);
}

function getDefaultLikeTarget(seed, category) {
  if (typeof seed.likeTarget === "number") return seed.likeTarget;
  if (category === "notice") return 4;
  if (category === "study" || category === "info" || category === "question") return 5;
  return 3;
}

function getDefaultBookmarkTarget(seed, category) {
  if (typeof seed.bookmarkTarget === "number") return seed.bookmarkTarget;
  if (category === "study" || category === "info" || category === "question") return 4;
  if (category === "market") return 3;
  return 2;
}

function getDefaultDislikeTarget(seed, category) {
  if (typeof seed.dislikeTarget === "number") return seed.dislikeTarget;
  return category === "notice" ? 0 : 1;
}

function makeCommentAuthorKey(postRecord, index) {
  if (postRecord.seed.commentAuthors?.[index]) {
    return postRecord.seed.commentAuthors[index];
  }

  if (index === 0 && postRecord.sequence % 4 === 0 && postRecord.seed.authorKey !== DEMO_USER_KEY) {
    return DEMO_USER_KEY;
  }

  return USER_SEEDS[(postRecord.sequence + index * 3 + 1) % USER_SEEDS.length].key;
}

function makeReplyAuthorKey(postRecord, parentIndex) {
  if (parentIndex === 0 && postRecord.seed.authorKey !== DEMO_USER_KEY) {
    return DEMO_USER_KEY;
  }

  return USER_SEEDS[(postRecord.sequence + parentIndex * 2 + 4) % USER_SEEDS.length].key;
}

function getPostDates(seed, sequence) {
  const [hour, minute] = seed.time || [9 + (sequence % 9), (sequence * 7) % 55];
  const createdAt = makeDate(seed.daysAgo, hour, minute);
  const updatedAt = seed.editHours ? addHours(createdAt, seed.editHours) : createdAt;
  return { createdAt, updatedAt };
}

function getUserByKey(userMap, key) {
  const user = userMap.get(key);

  if (!user) {
    throw new Error(`Unknown seed user key: ${key}`);
  }

  return user;
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
  const userMap = new Map();

  for (let index = 0; index < USER_SEEDS.length; index += 1) {
    const seed = USER_SEEDS[index];
    const createdAt = makeDate(55 - index, 9, 0);

    const user = await tx.user.create({
      data: {
        email: seed.email,
        nickname: seed.nickname,
        passwordHash,
        createdAt,
        updatedAt: createdAt,
      },
    });

    userMap.set(seed.key, user);
  }

  return userMap;
}

async function seedPosts(tx, userMap) {
  const postRecords = [];
  let sequence = 0;

  for (const [category, seeds] of Object.entries(POST_SEEDS)) {
    for (const seed of seeds) {
      const author = getUserByKey(userMap, seed.authorKey);
      const { createdAt, updatedAt } = getPostDates(seed, sequence);

      const post = await tx.post.create({
        data: {
          userId: author.id,
          title: seed.title,
          content: seed.content,
          category,
          isAnonymous: Boolean(seed.isAnonymous),
          viewCount: seed.viewCount,
          createdAt,
          updatedAt,
        },
      });

      postRecords.push({
        ...post,
        category,
        sequence,
        seed,
      });

      sequence += 1;
    }
  }

  return postRecords;
}

async function seedComments(tx, userMap, postRecords) {
  let commentCount = 0;
  let replyCount = 0;

  for (const postRecord of postRecords) {
    const templates = COMMENT_TEMPLATES[postRecord.category] || COMMENT_TEMPLATES.free;
    const topLevelCount = postRecord.seed.commentTarget ?? 2;
    const topLevelComments = [];

    for (let index = 0; index < topLevelCount; index += 1) {
      const authorKey = makeCommentAuthorKey(postRecord, index);
      const author = getUserByKey(userMap, authorKey);
      const createdAt = addMinutes(postRecord.createdAt, 25 + index * 41);
      const edited = index === 1 && postRecord.sequence % 3 === 0;

      const comment = await tx.comment.create({
        data: {
          postId: postRecord.id,
          userId: author.id,
          content: templates[index % templates.length],
          isAnonymous: (postRecord.sequence + index) % 6 === 0,
          createdAt,
          updatedAt: edited ? addMinutes(createdAt, 80) : createdAt,
        },
      });

      topLevelComments.push(comment);
      commentCount += 1;
    }

    const replyTarget = Math.min(postRecord.seed.replyTarget ?? (topLevelCount >= 4 ? 2 : topLevelCount >= 2 ? 1 : 0), topLevelComments.length);

    for (let index = 0; index < replyTarget; index += 1) {
      const parent = topLevelComments[index];
      const author = getUserByKey(userMap, makeReplyAuthorKey(postRecord, index));
      const createdAt = addMinutes(parent.createdAt, 35 + index * 27);

      await tx.comment.create({
        data: {
          postId: postRecord.id,
          userId: author.id,
          parentId: parent.id,
          content: REPLY_TEMPLATES[(postRecord.sequence + index) % REPLY_TEMPLATES.length],
          isAnonymous: (postRecord.sequence + index) % 5 === 0,
          createdAt,
          updatedAt: createdAt,
        },
      });

      replyCount += 1;
    }
  }

  return { commentCount, replyCount };
}

async function seedReactions(tx, userMap, postRecords) {
  let likeCount = 0;
  let dislikeCount = 0;
  let bookmarkCount = 0;

  for (const postRecord of postRecords) {
    const likeTarget = getDefaultLikeTarget(postRecord.seed, postRecord.category);
    const dislikeTarget = getDefaultDislikeTarget(postRecord.seed, postRecord.category);
    const bookmarkTarget = getDefaultBookmarkTarget(postRecord.seed, postRecord.category);
    const likeKeys = buildReactionKeys(postRecord, "like", Math.min(likeTarget, USER_SEEDS.length), []);
    const dislikeKeys = buildReactionKeys(postRecord, "dislike", Math.min(dislikeTarget, USER_SEEDS.length - likeKeys.length), likeKeys);
    const bookmarkKeys = buildReactionKeys(postRecord, "bookmark", Math.min(bookmarkTarget, USER_SEEDS.length), []);

    for (let index = 0; index < likeKeys.length; index += 1) {
      await tx.like.create({
        data: {
          postId: postRecord.id,
          userId: getUserByKey(userMap, likeKeys[index]).id,
          createdAt: addMinutes(postRecord.createdAt, 15 + index * 11),
        },
      });
      likeCount += 1;
    }

    for (let index = 0; index < dislikeKeys.length; index += 1) {
      await tx.dislike.create({
        data: {
          postId: postRecord.id,
          userId: getUserByKey(userMap, dislikeKeys[index]).id,
          createdAt: addMinutes(postRecord.createdAt, 20 + index * 13),
        },
      });
      dislikeCount += 1;
    }

    for (let index = 0; index < bookmarkKeys.length; index += 1) {
      await tx.bookmark.create({
        data: {
          postId: postRecord.id,
          userId: getUserByKey(userMap, bookmarkKeys[index]).id,
          createdAt: addMinutes(postRecord.createdAt, 28 + index * 17),
        },
      });
      bookmarkCount += 1;
    }
  }

  return { likeCount, dislikeCount, bookmarkCount };
}

async function buildSummary() {
  const [users, posts, comments, replies, likes, dislikes, bookmarks, groupedPosts, postStats] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count({ where: { parentId: null } }),
    prisma.comment.count({ where: { parentId: { not: null } } }),
    prisma.like.count(),
    prisma.dislike.count(),
    prisma.bookmark.count(),
    prisma.post.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    }),
    prisma.post.findMany({
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const postsByCategory = Object.keys(CATEGORY_LABELS).reduce((counts, category) => {
    const group = groupedPosts.find((item) => item.category === category);
    counts[category] = group?._count?._all ?? 0;
    return counts;
  }, {});

  const hotCandidates = postStats
    .map((post) => ({
      title: post.title,
      category: post.category,
      hotScore: post.viewCount + post._count.likes * 10 + post._count.comments * 5 - post._count.dislikes * 3,
    }))
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 5);

  const recentPosts = postStats.slice(0, 5).map((post) => ({
    title: post.title,
    category: post.category,
    createdAt: post.createdAt,
  }));

  return {
    users,
    posts,
    comments,
    replies,
    likes,
    dislikes,
    bookmarks,
    postsByCategory,
    hotCandidates,
    recentPosts,
    demoAccount: USER_SEEDS.find((user) => user.key === DEMO_USER_KEY),
    accounts: USER_SEEDS.map(({ email, nickname }) => ({ email, nickname })),
  };
}

async function main() {
  assertSafeToRun();

  console.log("기존 DB 데이터를 삭제하고 v1.2.0 시연용 seed 데이터로 교체합니다.");

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  await prisma.$transaction(
    async (tx) => {
      await resetData(tx);

      const userMap = await seedUsers(tx, passwordHash);
      const postRecords = await seedPosts(tx, userMap);
      await seedComments(tx, userMap, postRecords);
      await seedReactions(tx, userMap, postRecords);
    },
    {
      maxWait: 20000,
      timeout: 120000,
    }
  );

  const summary = await buildSummary();

  console.log("Development seed completed.");
  console.log("기존 데이터가 삭제되고 새 seed 데이터로 교체되었습니다.");
  console.log(`All test account passwords: ${PASSWORD}`);
  console.log(`users count: ${summary.users}`);
  console.log(`posts count: ${summary.posts}`);
  console.log(`comments count: ${summary.comments}`);
  console.log(`replies count: ${summary.replies}`);
  console.log(`likes count: ${summary.likes}`);
  console.log(`dislikes count: ${summary.dislikes}`);
  console.log(`bookmarks count: ${summary.bookmarks}`);
  console.log("category별 post count:");
  console.table(summary.postsByCategory);
  console.log("top hot 후보:");
  console.table(summary.hotCandidates);
  console.log("recent posts:");
  console.table(summary.recentPosts);
  console.log("대표 시연 계정:");
  console.table({
    email: summary.demoAccount.email,
    nickname: summary.demoAccount.nickname,
    password: PASSWORD,
  });
  console.log("테스트 계정 목록:");
  console.table(summary.accounts);
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
