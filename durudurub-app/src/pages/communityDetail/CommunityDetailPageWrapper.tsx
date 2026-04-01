import { useParams, useNavigate } from 'react-router';
import { CommunityDetailPage } from '@/pages/communityDetail/CommunityDetailPage';
import { useApp } from '@/contexts/AppContext';
import { mockCommunities } from '@/data/mockCommunities';
import { Error404Page } from '@/pages/error/Error404Page';

export function CommunityDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();

  // mockCommunities에서 해당 모임 찾기
  const community = mockCommunities.find((c) => c.id === id);

  if (!community && !id) {
    return <Error404Page />;
  }

  // mockCommunities에 없는 경우 기본 데이터 생성 (내 모임 관리에서 올 수 있음)
  let communityData: any;

  if (community) {
    // mockCommunities에서 찾은 경우
    communityData = {
      id: community.id,
      image: community.imageUrl || '',
      title: community.title,
      description: community.description,
      location: community.location,
      hostName: community.hostName,
      hostId: community.hostId,
      participants: {
        current: community.memberCount,
        max: community.maxMembers,
      },
      category: community.category,
      createdAt: community.createdAt,
    };
  } else {
    // ID별 매핑 (MyGroupsManagement의 mock 데이터와 동기화)
    let title = '모임';
    let category = '기타';
    let memberCount = 10;
    let maxMembers = 20;

    if (id === '1') {
      title = '주말 등산 모임';
      category = '운동';
      memberCount = 12;
      maxMembers = 20;
    } else if (id === '2') {
      title = '독서 토론 클럽';
      category = '문화';
      memberCount = 8;
      maxMembers = 15;
    } else if (id === '3') {
      title = '사진 촬영 동호회';
      category = '취미';
      memberCount = 15;
      maxMembers = 25;
    } else if (id === '4') {
      title = '요리 레시피 공유';
      category = '요리';
      memberCount = 10;
      maxMembers = 20;
    }

    communityData = {
      id: id,
      title: title,
      description: `${title}에 오신 것을 환영합니다!`,
      location: '서울',
      hostName: '모임 리더',
      hostId: 'test',
      participants: {
        current: memberCount,
        max: maxMembers,
      },
      category: category,
      createdAt: new Date().toISOString(),
    };
  }

  return (
    <CommunityDetailPage
      {...communityData}
      user={user}
      onBack={() => navigate(-1)}
      onLoginClick={() => navigate('/login')}
    />
  );
}
