export interface Community {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  hostId: string;
  hostName: string;
  memberCount: number;
  maxMembers: number;
  imageUrl?: string;
  createdAt: string;
}

// 예시 모임 데이터
export const mockCommunities: Community[] = [
  // 운동 카테고리
  {
    id: 'comm1',
    title: '강남 러닝크루',
    description: '매주 토요일 아침 한강에서 함께 달려요! 초보자도 환영합니다.',
    category: '운동',
    location: '서울 강남구',
    hostId: 'host1',
    hostName: '달리기왕',
    memberCount: 12,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1623208525215-a573aacb1560?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY3JldyUyMGpvZ2dpbmd8ZW58MXx8fHwxNzY5NTkyMDE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-20T09:00:00Z'
  },
  {
    id: 'comm2',
    title: '요가 힐링 모임',
    description: '직장인들을 위한 저녁 요가 클래스. 스트레스 해소와 건강 관리를 함께해요.',
    category: '운동',
    location: '서울 마포구',
    hostId: 'host2',
    hostName: '요가지니',
    memberCount: 8,
    maxMembers: 15,
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3Njk1OTIwMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-19T14:30:00Z'
  },
  {
    id: 'comm3',
    title: '배드민턴 동호회',
    description: '주말마다 배드민턴 치면서 땀 흘려요. 경기도 하고 친목도 다져요!',
    category: '운동',
    location: '서울 송파구',
    hostId: 'host3',
    hostName: '스매시킹',
    memberCount: 15,
    maxMembers: 24,
    imageUrl: 'https://images.unsplash.com/photo-1626225015999-2e53f6aaa008?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWRtaW50b24lMjBzcG9ydHMlMjBjb3VydHxlbnwxfHx8fDE3Njk1OTIwMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-18T11:00:00Z'
  },
  
  // 문화/예술 카테고리
  {
    id: 'comm4',
    title: '주말 미술관 투어',
    description: '매주 다른 미술관을 방문하며 예술 작품을 감상하는 모임입니다.',
    category: '문화/예술',
    location: '서울 종로구',
    hostId: 'host4',
    hostName: '아트러버',
    memberCount: 10,
    maxMembers: 15,
    imageUrl: 'https://images.unsplash.com/photo-1662049024498-4fbc4468455e?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBtdXNldW0lMjBnYWxsZXJ5fGVufDF8fHx8MTc2OTU1NjM1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-22T10:00:00Z'
  },
  {
    id: 'comm5',
    title: '취미 사진 동호회',
    description: '사진 찍는 것을 좋아하는 사람들의 모임. 출사도 가고 작품도 공유해요.',
    category: '문화/예술',
    location: '서울 강서구',
    hostId: 'host5',
    hostName: '셔터맨',
    memberCount: 18,
    maxMembers: 25,
    imageUrl: 'https://images.unsplash.com/photo-1588420635201-3a9e2a2a0a07?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYSUyMGhvYmJ5fGVufDF8fHx8MTc2OTUwNDAyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-21T16:00:00Z'
  },
  {
    id: 'comm6',
    title: '클래식 음악 감상회',
    description: '매월 클래식 공연을 함께 관람하고 감상을 나누는 우아한 모임입니다.',
    category: '문화/예술',
    location: '서울 서초구',
    hostId: 'host6',
    hostName: '베토벤',
    memberCount: 7,
    maxMembers: 12,
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBtdXNpYyUyMGNvbmNlcnR8ZW58MXx8fHwxNzY5NTkyMDE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-20T13:00:00Z'
  },

  // 요리/음식 카테고리
  {
    id: 'comm7',
    title: '홈베이킹 클래스',
    description: '집에서 빵과 디저트를 만들며 달콤한 시간을 보내요. 레시피 공유도 활발해요!',
    category: '요리/음식',
    location: '서울 성동구',
    hostId: 'host7',
    hostName: '베이킹마스터',
    memberCount: 14,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1612031337676-3981ffa2a1a6?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtpbmclMjBicmVhZCUyMGRlc3NlcnR8ZW58MXx8fHwxNzY5NTkyMDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-23T09:30:00Z'
  },
  {
    id: 'comm8',
    title: '맛집 탐방 모임',
    description: '서울 곳곳의 숨은 맛집을 찾아다니는 미식가들의 모임입니다.',
    category: '요리/음식',
    location: '서울 전역',
    hostId: 'host8',
    hostName: '푸디킹',
    memberCount: 22,
    maxMembers: 30,
    imageUrl: 'https://images.unsplash.com/photo-1646473267592-61e8630367bd?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRlbGljaW91c3xlbnwxfHx8fDE3Njk1MDkwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-22T18:00:00Z'
  },
  {
    id: 'comm9',
    title: '와인 공부 모임',
    description: '와인을 테이스팅하며 와인 지식을 쌓아가는 성인 모임입니다.',
    category: '요리/음식',
    location: '서울 용산구',
    hostId: 'host9',
    hostName: '소믈리에',
    memberCount: 9,
    maxMembers: 12,
    imageUrl: 'https://images.unsplash.com/photo-1627626651107-7ce593b9bd76?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwdGFzdGluZyUyMGdsYXNzZXN8ZW58MXx8fHwxNzY5NTc1Mjg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-19T20:00:00Z'
  },

  // 여행 카테고리
  {
    id: 'comm10',
    title: '주말 근교 여행',
    description: '주말마다 서울 근교의 멋진 곳을 탐험하는 여행 모임입니다.',
    category: '여행',
    location: '경기도 일대',
    hostId: 'host10',
    hostName: '트래블러',
    memberCount: 16,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1639974394918-acd409d48630?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBuYXR1cmV8ZW58MXx8fHwxNzY5NTExMjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-24T08:00:00Z'
  },
  {
    id: 'comm11',
    title: '해외여행 동행 찾기',
    description: '해외여행을 함께 갈 동행을 찾고 여행 정보를 공유하는 모임입니다.',
    category: '여행',
    location: '온라인',
    hostId: 'host11',
    hostName: '글로벌트립',
    memberCount: 25,
    maxMembers: 50,
    imageUrl: 'https://images.unsplash.com/photo-1760229803660-fc5d996d9b79?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHRyYXZlbCUyMGpvdXJuZXl8ZW58MXx8fHwxNzY5NTkyMDE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-23T15:00:00Z'
  },

  // 독서 카테고리
  {
    id: 'comm12',
    title: '북클럽 독서모임',
    description: '한 달에 한 권씩 책을 읽고 토론하는 진지한 독서 모임입니다.',
    category: '독서',
    location: '서울 중구',
    hostId: 'host12',
    hostName: '북러버',
    memberCount: 11,
    maxMembers: 15,
    imageUrl: 'https://images.unsplash.com/photo-1643316791771-ac9b7b5a2238?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY2x1YiUyMHJlYWRpbmd8ZW58MXx8fHwxNzY5NTA0NDc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-25T19:00:00Z'
  },
  {
    id: '1',
    title: 'test 리더의 독서 모임',
    description: 'test 계정이 리더로 있는 독서 모임입니다. 매주 토요일 오전 9시에 모여서 책에 대해 이야기를 나누고 함께 성장합니다. 신규 멤버 환영!',
    category: '독서',
    location: '서울 강남구 테헤란로 152',
    hostId: 'test',
    hostName: 'test',
    memberCount: 5,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFkaW5nJTIwYm9vayUyMGxpYnJhcnl8ZW58MXx8fHwxNzY5NTkyMDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'comm13',
    title: '자기계발서 읽기',
    description: '자기계발서를 읽고 실천 방법을 나누며 함께 성장하는 모임입니다.',
    category: '독서',
    location: '서울 강남구',
    hostId: 'host13',
    hostName: '성장왕',
    memberCount: 13,
    maxMembers: 18,
    imageUrl: 'https://images.unsplash.com/photo-1658842042779-dc9ab3125690?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwZGV2ZWxvcG1lbnQlMjBib29rc3xlbnwxfHx8fDE3Njk1OTIwMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-24T17:00:00Z'
  },
  {
    id: 'comm14',
    title: '영어원서 읽기 모임',
    description: '영어원서를 함께 읽으며 영어 실력과 독서 습관을 동시에 키워요.',
    category: '독서',
    location: '서울 서대문구',
    hostId: 'host14',
    hostName: 'EnglishReader',
    memberCount: 8,
    maxMembers: 12,
    imageUrl: 'https://images.unsplash.com/photo-1566131807516-e3b3cd1a89d1?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwYm9vayUyMHJlYWRpbmd8ZW58MXx8fHwxNzY5NTkyMDIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-23T10:00:00Z'
  },

  // 스터디 카테고리
  {
    id: 'comm15',
    title: '코딩 스터디',
    description: '개발자들이 모여 코딩 실력을 향상시키는 스터디입니다. 프로젝트도 함께 진행해요.',
    category: '스터디',
    location: '서울 강남구',
    hostId: 'host15',
    hostName: '코드마스터',
    memberCount: 10,
    maxMembers: 15,
    imageUrl: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZyUyMGxhcHRvcHxlbnwxfHx8fDE3Njk0ODIwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-26T14:00:00Z'
  },
  {
    id: 'comm16',
    title: '토익 스터디',
    description: '토익 고득점을 목표로 하는 스터디 모임입니다. 매주 모의고사 진행!',
    category: '스터디',
    location: '서울 동작구',
    hostId: 'host16',
    hostName: 'TOEIC990',
    memberCount: 12,
    maxMembers: 16,
    imageUrl: 'https://images.unsplash.com/photo-1650525218265-d6fef4ada666?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2VpYyUyMGVuZ2xpc2glMjBzdHVkeXxlbnwxfHx8fDE3Njk1OTIwMjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-25T11:00:00Z'
  },
  {
    id: 'comm17',
    title: '재테크 공부 모임',
    description: '주식, 부동산, 재테크 정보를 공유하고 함께 공부하는 모임입니다.',
    category: '스터디',
    location: '서울 여의도',
    hostId: 'host17',
    hostName: '머니마스터',
    memberCount: 20,
    maxMembers: 25,
    imageUrl: 'https://images.unsplash.com/photo-1665656653092-684fdd316aca?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZlc3RtZW50JTIwZmluYW5jZSUyMHN0b2NrfGVufDF8fHx8MTc2OTU5MjAyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-24T19:30:00Z'
  },

  // 게임 카테고리
  {
    id: 'comm18',
    title: '보드게임 모임',
    description: '다양한 보드게임을 즐기며 친목을 다지는 모임입니다.',
    category: '게임',
    location: '서울 홍대',
    hostId: 'host18',
    hostName: '게임러버',
    memberCount: 15,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1677094365560-9f88ce594e7c?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZCUyMGdhbWVzJTIwZnJpZW5kc3xlbnwxfHx8fDE3Njk1MDk3MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-26T18:00:00Z'
  },
  {
    id: 'comm19',
    title: 'LOL 게임 클랜',
    description: '리그오브레전드를 함께 즐기는 게이머들의 모임. 랭크 게임도 함께!',
    category: '게임',
    location: '온라인',
    hostId: 'host19',
    hostName: '챌린저',
    memberCount: 18,
    maxMembers: 30,
    imageUrl: 'https://images.unsplash.com/photo-1759701547201-04a7366e3439?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBlc3BvcnRzJTIwb25saW5lfGVufDF8fHx8MTc2OTU5MjAyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-25T20:00:00Z'
  },

  // 기타 카테고리
  {
    id: 'comm20',
    title: '반려동물 산책 모임',
    description: '반려견과 함께 산책하며 정보를 나누는 반려인 모임입니다.',
    category: '기타',
    location: '서울 한강공원',
    hostId: 'host20',
    hostName: '멍냥사랑',
    memberCount: 17,
    maxMembers: 25,
    imageUrl: 'https://images.unsplash.com/photo-1616420486543-9d94ce1af95b?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjB3YWxraW5nJTIwcGFya3xlbnwxfHx8fDE3Njk1MDQ4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-26T09:00:00Z'
  },
  {
    id: 'comm21',
    title: '봉사활동 모임',
    description: '정기적으로 봉사활동을 함께하는 따뜻한 마음을 가진 사람들의 모임입니다.',
    category: '기타',
    location: '서울 전역',
    hostId: 'host21',
    hostName: '착한사람',
    memberCount: 14,
    maxMembers: 20,
    imageUrl: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXIlMjBjb21tdW5pdHklMjBzZXJ2aWNlfGVufDF8fHx8MTc2OTQ5NTE3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-25T12:00:00Z'
  },
  {
    id: 'comm22',
    title: '플리마켓 모임',
    description: '중고 물품을 사고팔며 친환경 소비를 실천하는 모임입니다.',
    category: '기타',
    location: '서울 성수동',
    hostId: 'host22',
    hostName: '에코러버',
    memberCount: 11,
    maxMembers: 30,
    imageUrl: 'https://images.unsplash.com/photo-1712737763151-98281734aae8?crop=entropy&cs=tinysrgb&fit=max&fm=png&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGVhJTIwbWFya2V0JTIwdmludGFnZXxlbnwxfHx8fDE3Njk1OTIwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    createdAt: '2025-01-24T13:00:00Z'
  }
];