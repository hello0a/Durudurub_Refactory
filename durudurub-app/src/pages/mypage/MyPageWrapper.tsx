import { useNavigate } from 'react-router';
import { MyPage } from '@/pages/mypage/MyPage';
import { useApp } from '@/contexts/AppContext';

export function MyPageWrapper() {
  const navigate = useNavigate();
  const { user, profileImage, handleProfileImageUpdate, handleLogout } = useApp();

  console.log("user :::::: ", user);
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <MyPage
      onBack={() => navigate('/')}
      user={user}
      profileImage={profileImage}
      onProfileImageUpdate={handleProfileImageUpdate}
      onNavigateToGroupsManagement={() => navigate('/meetings')}
      onNavigateToFavorites={() => navigate('/favorites')}
      onSignupClick={() => navigate('/signup')}
      onLoginClick={() => navigate('/login')}
      onLogoClick={() => navigate('/')}
      onNoticeClick={() => navigate('/notice')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      onLogout={handleLogout}
      onPaymentClick={() => navigate('/payment')}
    />
  );
}
