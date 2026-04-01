import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showFooter?: boolean;
  currentPage?: string;
  onHomeClick: () => void;
  onMyPageClick: () => void;
  onCategoryClick: () => void;
  onSearchClick: () => void;
  onNoticeClick?: () => void;
  isLoggedIn?: boolean;
}

export function PageLayout({
  children,
  showBottomNav = true,
  showFooter = true,
  currentPage = 'home',
  onHomeClick,
  onMyPageClick,
  onCategoryClick,
  onSearchClick,
  onNoticeClick,
  isLoggedIn = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      
      {/* 푸터 - 모바일에서도 표시, BottomNavigation 위에 위치 */}
      {showFooter && (
        <div className="pb-16 md:pb-0">
          <Footer onNoticeClick={onNoticeClick} />
        </div>
      )}
      
      {/* 하단 네비게이션 - 모바일 전용, 고정 위치 */}
      {showBottomNav && (
        <BottomNavigation
          onHomeClick={onHomeClick}
          onMyPageClick={onMyPageClick}
          onCategoryClick={onCategoryClick}
          onSearchClick={onSearchClick}
          currentPage={currentPage}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}