import { useParams, useNavigate } from 'react-router';
import { CategoryPage } from '@/pages/category/CategoryPage';
import { useApp } from '@/contexts/AppContext';

export function CategoryPageWrapper() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useApp();

  const handleMeetingClick = (meeting: any) => {
    // Meeting 데이터를 CommunityDetailPage에 맞는 형식으로 변환하여 이동
    navigate(`/community/${meeting.id}`, {
      state: {
        communityData: {
          id: meeting.id,
          image: meeting.image,
          title: meeting.title,
          description: `${meeting.date}에 진행되는 ${meeting.title}입니다. 함께 즐거운 시간을 보내요!`,
          location: meeting.location,
          hostName: meeting.host,
          hostId: meeting.hostId,
          participants: {
            current: meeting.participants,
            max: meeting.maxParticipants,
          },
        },
      },
    });
  };

  if (!category) {
    return null;
  }

  return (
    <CategoryPage
      category={category}
      onBack={() => navigate('/')}
      user={user}
      onSignupClick={() => navigate('/signup')}
      onMeetingClick={handleMeetingClick}
      onLoginClick={() => navigate('/login')}
      onCreateClick={() => navigate('/community/create')}
      onLogoClick={() => navigate('/')}
    />
  );
}
