import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/header/Navbar';
import { BottomNavigation } from '@/components/footer/BottomNavigation';
import { Footer } from '@/components/footer/Footer';
import { useApp } from '@/contexts/AppContext';

function RootShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profileImage, handleLogout } = useApp();

  const pathname = location.pathname;
  const currentPage = pathname === '/'
    ? 'home'
    : pathname.startsWith('/mypage') || pathname.startsWith('/meetings') || pathname.startsWith('/favorites')
      ? 'mypage'
      : pathname.startsWith('/explore') || pathname.startsWith('/category') || pathname.startsWith('/community')
        ? 'category'
        : 'home';

  return (
    <>
      <Navbar
        onLogoClick={() => navigate('/')}
        onSignupClick={() => navigate('/signup')}
        onLoginClick={() => navigate('/login')}
        onNoticeClick={() => navigate('/notice')}
        onMyPageClick={() => navigate('/mypage')}
        onMiniGameClick={() => navigate('/minigame')}
        onMyMeetingsClick={() => navigate('/meetings')}
        onAdminClick={() => navigate('/admin')}
        onPaymentClick={() => navigate('/payment')}
        onExploreClick={(query?: string) => {
          navigate(query ? `/explore?q=${encodeURIComponent(query)}` : '/explore');
        }}
        onCommunityClick={(communityId: string) => navigate(`/community/${communityId}`)}
        user={user}
        profileImage={profileImage}
        onLogout={handleLogout}
      />

      <Outlet />

      <BottomNavigation
        onHomeClick={() => navigate('/')}
        onMyPageClick={() => {
          if (user) {
            navigate('/mypage');
            return;
          }
          navigate('/login');
        }}
        onCategoryClick={() => navigate('/explore')}
        onSearchClick={(query?: string) => {
          navigate(query ? `/explore?q=${encodeURIComponent(query)}` : '/explore');
        }}
        currentPage={currentPage}
        isLoggedIn={!!user}
      />
      <Footer />
    </>
  );
}

export function RootLayout() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <RootShell />
    </AppProvider>
  );
}
