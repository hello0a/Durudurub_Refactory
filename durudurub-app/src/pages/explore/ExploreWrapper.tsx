import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExplorePage } from './ExplorePage';
import { useApp } from '@/contexts/AppContext';


// 기존 explore
export default function ExploreWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, accessToken, profileImage, handleLogout } = useApp();

  return (
    <ExplorePage
      onBack={() => navigate(-1)}
      onCommunityClick={(id: string) => navigate(`/club/${id}`)}
      onLoginClick={() => navigate('/login')}
      onSignupClick={() => navigate('/signup')}
      onLogoClick={() => navigate('/')}
      onNoticeClick={() => navigate('/notice')}
      onMyPageClick={() => navigate('/mypage')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      onPaymentClick={() => navigate('/payment')}
      onCreateClick={() => navigate('/community/create')}
      onLogout={handleLogout}
      user={user}
      accessToken={accessToken}
      profileImage={profileImage}
      initialSearchQuery={searchParams.get('q') || ''}
      initialCategory={searchParams.get('category') || ''}
      onSearchClick={(query) => {
        const trimmed = (query || '').trim();
        navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
      }}
    />
  );
}