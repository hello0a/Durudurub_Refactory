import { useNavigate } from 'react-router';
import { MyGroupsManagement } from '@/components/mypage/MyGroupsManagement';
import { useApp } from '@/contexts/AppContext';

export function MyMeetingsWrapper() {
  const navigate = useNavigate();
  const { user, profileImage, handleLogout } = useApp();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <MyGroupsManagement
      onBack={() => navigate('/')}
      user={user}
      profileImage={profileImage}
      onSignupClick={() => navigate('/signup')}
      onLoginClick={() => navigate('/login')}
      onLogoClick={() => navigate('/')}
      onNoticeClick={() => navigate('/notice')}
      onMyPageClick={() => navigate('/mypage')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      onLogout={handleLogout}
      onCommunityClick={(communityId) => navigate(`/community/${communityId}`)}
    />
  );
}
