import { useNavigate } from 'react-router';
import { CreateCommunityPage } from '@/pages/communityCreate/CreateCommunityPage';
import { useApp } from '@/contexts/AppContext';

export function CreateCommunityPageWrapper() {
  const navigate = useNavigate();
  const { user, accessToken, profileImage, handleLogout } = useApp();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user || !accessToken) {
    navigate('/login');
    return null;
  }

  return (
    <CreateCommunityPage
      onBack={() => navigate('/')}
      user={user}
      onSignupClick={() => navigate('/signup')}
      onLoginClick={() => navigate('/login')}
      onLogoClick={() => navigate('/')}
      onNoticeClick={() => navigate('/notice')}
      onMyPageClick={() => navigate('/mypage')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      profileImage={profileImage}
      onLogout={handleLogout}
    />
  );
}
