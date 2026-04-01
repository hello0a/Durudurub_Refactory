import { useNavigate } from 'react-router';
import { useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { AdBanner } from '@/components/home/AdBanner';
import { SearchModal } from '@/components/modal/SearchModal';
import { useApp } from '@/contexts/AppContext';
import { mockCommunities } from '@/data/mockCommunities';
import styles from '@/App.module.css';

// 새로운 홈
export function HomePage() {
  const navigate = useNavigate();
  const { user, profileImage, handleLogout } = useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category}`);
  };

  const handleCommunityClick = (community: any) => {
    navigate(`/community/${community.id}`);
  };

  const handleCommunityClickFromSearch = (communityId: string) => {
    navigate(`/community/${communityId}`);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        <div className={styles.container}>
          {/* 히어로 섹션 - 모바일에서 숨김 */}
          <section className={`${styles.heroSection} hidden md:block`}>
            <HeroSection onExploreClick={() => navigate('/explore')} />
          </section>

          {/* 광고 배너 섹션 */}
          <section className={styles.adBannerSection}>
            <AdBanner />
          </section>

          {/* 카테고리별 모임 섹션 */}
          <section className={styles.categorySection}>
            <CategorySection 
              onCategoryClick={handleCategoryClick}
              onMoreClick={() => navigate('/explore')}
            />
          </section>
        </div>
      </main>

      {/* Search Modal */}
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
    </div>
  );
}