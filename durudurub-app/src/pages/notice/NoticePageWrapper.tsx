import { useNavigate } from 'react-router';
import { NoticePage } from '@/pages/notice/NoticePage';
import { useApp } from '@/contexts/AppContext';

export function NoticePageWrapper() {
  const navigate = useNavigate();
  const { user, accessToken, profileImage, handleLogout } = useApp();

  return (
    <NoticePage
      onBack={() => navigate('/notice', { replace: true })}
      user={user}
      accessToken={accessToken}
      onSignupClick={() => navigate('/signup')}
      onLoginClick={() => navigate('/login')}
      onLogoClick={() => navigate('/')}
      onMyPageClick={() => navigate('/mypage')}
      onMiniGameClick={() => navigate('/minigame')}
      onMyMeetingsClick={() => navigate('/meetings')}
      profileImage={profileImage}
      onLogout={handleLogout}
      onNoticeWriteClick={(notice) => {
        if (notice) {
          navigate('/notice/write', { state: { editingNotice: notice } });
        } else {
          navigate('/notice/write');
        }
      }}
    />
  );
}
