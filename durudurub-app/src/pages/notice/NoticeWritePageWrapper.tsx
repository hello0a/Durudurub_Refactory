import { useNavigate, useLocation } from 'react-router';
import { NoticeWritePage } from '@/pages/notice/NoticeWritePage';
import { useApp } from '@/contexts/AppContext';

export function NoticeWritePageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken, profileImage, handleLogout } = useApp();
  
  const editingNotice = (location.state as any)?.editingNotice || null;

  return (
    <NoticeWritePage
      onBack={() => navigate('/notice')}
      user={user}
      accessToken={accessToken}
      onSignupClick={() => navigate('/signup')}
      onLoginClick={() => navigate('/login')}
      onLogoClick={() => navigate('/')}
      onNoticeClick={() => navigate('/notice')}
      onMyPageClick={() => navigate('/mypage')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      profileImage={profileImage}
      onLogout={handleLogout}
      editingNotice={editingNotice}
    />
  );
}
