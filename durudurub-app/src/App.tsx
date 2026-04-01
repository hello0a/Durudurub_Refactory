import { Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ClubDetailWrapper from './pages/communityDetail/ClubDetailWrapper';
import ExploreWrapper from './pages/explore/ExploreWrapper';
import Home from './pages/Home';
import { LoginPage } from './pages/login/LoginPage';
import { SignupPage } from './pages/signup/SignupPage';
import { CreateCommunityPageWrapper } from './pages/communityCreate/CreateCommunityPageWrapper';
import { AppProvider, useApp } from './contexts/AppContext';
import { MyPageWrapper } from "./pages/mypage/MyPageWrapper";
import { MyMeetingsWrapper } from "./pages/mypage/MyMeetingsWrapper";
import { MiniGamePageWrapper, AdminPageWrapper, FavoritesPageWrapper } from './pages/other/OtherPagesWrapper';
import OAuthSuccess from './pages/login/OAuthSuccess';
import { Navbar } from './components/header/Navbar';
import { Footer } from './components/footer/Footer';
import { BottomNavigation } from './components/footer/BottomNavigation';
import { NoticePageWrapper } from './pages/notice/NoticePageWrapper';
import { NoticeWritePageWrapper } from './pages/notice/NoticeWritePageWrapper';

function AppRoutes() {
  const navigate = useNavigate();
  const { handleLogin } = useApp();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <LoginPage
            onClose={() => navigate('/')}
            onSignupClick={() => navigate('/signup')}
            onLoginSuccess={(userData, token, profileImage) => {
              handleLogin(userData, token, profileImage);
              navigate('/');
            }}
          />
        }
      />

      <Route path="/explore" element={<ExploreWrapper />} />
      <Route path="/community/create" element={<CreateCommunityPageWrapper />} />
      <Route path="/club/:id" element={<ClubDetailWrapper />} />
      <Route path="/community/:id" element={<ClubDetailWrapper />} />
      <Route path="/minigame" element={<MiniGamePageWrapper />} />

      <Route
        path="/signup"
        element={<SignupPage onClose={() => navigate('/')} onLoginClick={() => navigate('/login')} />}
      />

      <Route 
        path="/mypage"
        element={ <MyPageWrapper />}
      />

      <Route 
        path="/meetings"
        element={ <MyMeetingsWrapper />}
      />

      <Route 
        path="/favorites"
        element={ <FavoritesPageWrapper />}
      />

      <Route 
        path="/admin"
        element={ <AdminPageWrapper />}
      />

      <Route 
        path="/oauth-success"
        element={ <OAuthSuccess />}
      />

      <Route 
        path="/notice"
        element={ <NoticePageWrapper />}
      />
      <Route 
        path="/notice/write"
        element={ <NoticeWritePageWrapper />}
      />

    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
        <Navbar />
          <Toaster position="top-center" richColors />
          <AppRoutes />
          <BottomNavigation />
        <Footer />
    </AppProvider>
  );
}