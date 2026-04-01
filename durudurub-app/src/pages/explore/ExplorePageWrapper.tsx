import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { SearchModal } from '@/components/modal/SearchModal';
import { useApp } from '@/contexts/AppContext';
import { mockCommunities } from '@/data/mockCommunities';


// 새로운 explore
export function ExplorePageWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, accessToken, profileImage, handleLogout } = useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const searchQuery = searchParams.get('q') || '';

  const handleCommunityClickFromSearch = (communityId: string) => {
    navigate(`/community/${communityId}`);
    setIsSearchModalOpen(false);
  };

  return (
    <>
      <ExplorePage
        onBack={() => navigate('/')}
        onCommunityClick={(communityId) => navigate(`/community/${communityId}`)}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/signup')}
        onLogoClick={() => navigate('/')}
        onNoticeClick={() => navigate('/notice')}
        onMyPageClick={() => navigate('/mypage')}
        onMiniGameClick={() => navigate('/minigame')}
        onMyMeetingsClick={() => navigate('/meetings')}
        onPaymentClick={() => navigate('/payment')}
        onCreateClick={() => navigate('/community/create')}
        user={user}
        accessToken={accessToken}
        profileImage={profileImage}
        onLogout={handleLogout}
        initialSearchQuery={searchQuery}
        onSearchClick={(query) => {
          const trimmed = (query || '').trim();
          navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
        }}
      />
      
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={(query) => {
          navigate(`/explore?q=${encodeURIComponent(query)}`);
          setIsSearchModalOpen(false);
        }}
        user={user}
        communities={mockCommunities}
        onCommunityClick={handleCommunityClickFromSearch}
        onPaymentClick={() => {
          setIsSearchModalOpen(false);
          navigate('/payment');
        }}
      />
    </>
  );
}