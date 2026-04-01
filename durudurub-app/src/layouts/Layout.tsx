import React from 'react'
import { Navbar } from '@/components/header/Navbar'
import { useNavigate } from "react-router-dom";
import { useApp } from '@/contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {

  const navigate = useNavigate();
  const { user, profileImage, handleLogout } = useApp();

  const handleLogoClick = () => navigate('/');

  const handleSignupClick = () => navigate('/signup');

  const handleLoginClick = () => navigate('/login');

  const handleMiniGameClick = () => navigate('/minigame');

  const handleExploreClick = (query?: string) => {

    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : '/explore');
    
  };

  return (
    <>
      <Navbar
        onLogoClick={handleLogoClick}
        onSignupClick={handleSignupClick}
        onLoginClick={handleLoginClick}
        onMiniGameClick={handleMiniGameClick}
        onExploreClick={handleExploreClick}

        onMyPageClick={() => navigate("/mypage")}
        onMyMeetingsClick={() => navigate('/meetings')}
        onNoticeClick={() => navigate("/notice")}
        onAdminClick={() => navigate("/admin")}
        user={user}
        profileImage={profileImage}
        onLogout={handleLogout}
      />
      <div className="container mx-auto px-4">
        {children}
      </div>
    </>
  )
}

export default Layout