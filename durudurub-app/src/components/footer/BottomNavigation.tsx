import { Home, User, LayoutGrid, Search, Sparkles, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  onHomeClick?: () => void;
  onMyPageClick?: () => void;
  onCategoryClick?: () => void;
  onSearchClick?: (searchQuery?: string) => void;
  onAISearchClick?: () => void;
  currentPage?: string;
  isLoggedIn?: boolean;
}

export function BottomNavigation({
  onHomeClick,
  onMyPageClick,
  onCategoryClick,
  onSearchClick,
  onAISearchClick,
  currentPage = 'home',
  isLoggedIn = false,
}: BottomNavigationProps) {
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    onSearchClick?.(trimmedQuery);
    closeSearchModal();
  };

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: '홈',
      onClick: () => {
        if (onHomeClick) {
          onHomeClick();
          return;
        }
        navigate('/');
      },
    },
    {
      id: 'search',
      icon: Search,
      label: '검색',
      onClick: () => setShowSearchModal(true),
    },
    {
      id: 'category',
      icon: LayoutGrid,
      label: '카테고리',
      onClick: () => {
        if (onCategoryClick) {
          onCategoryClick();
          return;
        }
        navigate('/explore');
      },
    },
    {
      id: 'mypage',
      icon: User,
      label: '마이페이지',
      onClick: () => {
        if (onMyPageClick) {
          onMyPageClick();
          return;
        }
        navigate('/mypage');
      },
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[#00A651]' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-xs transition-colors ${
                    isActive ? 'text-[#00A651] font-semibold' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {showSearchModal && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40 flex items-end"
          onClick={closeSearchModal}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">검색</h2>
              <button
                type="button"
                onClick={closeSearchModal}
                className="p-1 text-gray-500"
                aria-label="검색 모달 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="flex-1 h-11 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                autoFocus
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-lg bg-[#00A651] text-white text-sm font-semibold"
              >
                검색
              </button>
            </form>

            {onAISearchClick && (
              <button
                type="button"
                onClick={() => {
                  onAISearchClick();
                  closeSearchModal();
                }}
                className="w-full h-11 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI 검색
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
