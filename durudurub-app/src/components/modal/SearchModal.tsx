import { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, MapPin, Users } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  user?: any;
  communities?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    hostName: string;
    memberCount: number;
    maxMembers: number;
    imageUrl?: string;
  }>;
  onCommunityClick?: (communityId: string) => void;
  onPaymentClick?: () => void;
}

// AI 검색 모달 컴포넌트
function AISearchModal({ 
  onClose, 
  onSearch, 
  isPremiumUser, 
  aiSearchCount,
  onPaymentClick,
  communities,
  onCommunityClick
}: { 
  onClose: () => void; 
  onSearch: (query: string) => void; 
  isPremiumUser: boolean;
  aiSearchCount: number;
  onPaymentClick?: () => void;
  communities?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    hostName: string;
    memberCount: number;
    maxMembers: number;
    imageUrl?: string;
  }>;
  onCommunityClick?: (communityId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const remainingSearches = Math.max(0, 3 - aiSearchCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && communities) {
      setHasSearched(true);
      
      // AI 검색 로직 (키워드 매칭)
      const query = searchQuery.toLowerCase();
      const results = communities.filter(community => 
        community.title.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query) ||
        community.category.toLowerCase().includes(query) ||
        community.location.toLowerCase().includes(query)
      );
      
      setSearchResults(results);
      onSearch(searchQuery);
    }
  };

  const handleCommunityClick = (communityId: string) => {
    onClose();
    onCommunityClick?.(communityId);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start md:items-center justify-center z-[100] overflow-y-auto">
      <div className="bg-white rounded-2xl w-full md:max-w-3xl relative shadow-2xl m-0 md:m-4 min-h-screen md:min-h-0 md:max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 헤더 */}
        <div className="bg-white rounded-t-2xl p-6 md:p-8 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">AI 검색</h2>
            </div>
            
            {/* 검색 횟수 표시 */}
            {!isPremiumUser && (
              <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-full text-xs md:text-sm font-medium text-gray-700">
                {remainingSearches}/3 남음
              </span>
            )}
            
            {isPremiumUser && (
              <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full text-xs md:text-sm font-semibold">
                무제한
              </span>
            )}
          </div>
        </div>

        {/* 검색 입력 영역 */}
        <div className="p-6 md:p-8 flex-shrink-0">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="예: 서울에서 주말 독서 모임"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 pl-11 md:pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  autoFocus
                />
                <Search className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                disabled={!searchQuery.trim() || (!isPremiumUser && remainingSearches === 0)}
                className={`w-full px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-white transition-all whitespace-nowrap shadow-lg text-sm md:text-base ${
                  !searchQuery.trim() || (!isPremiumUser && remainingSearches === 0)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 hover:shadow-xl'
                }`}
              >
                AI로 검색하기
              </button>
            </div>
          </form>

          {/* 검색 전 안내 텍스트 */}
          {!hasSearched && (
            <p className="text-gray-600 text-center mt-4 text-sm md:text-base">원하는 모임을 검색하세요!</p>
          )}

          {/* 검색 횟수 소진 안내 */}
          {!isPremiumUser && remainingSearches === 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-800 text-center">
                무료 검색 횟수를 모두 사용했습니다.{' '}
                <button
                  onClick={() => {
                    onClose();
                    onPaymentClick?.();
                  }}
                  className="font-semibold underline hover:text-purple-600"
                >
                  프리미엄 구독하기
                </button>
              </p>
            </div>
          )}
        </div>

        {/* 검색 결과 영역 */}
        {hasSearched && (
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8">
            <div className="pt-2 md:pt-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                검색 결과 {searchResults.length}개
              </h3>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">다른 키워드로 검색해보세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((community) => (
                    <div
                      key={community.id}
                      onClick={() => handleCommunityClick(community.id)}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex gap-3 md:gap-4">
                        {community.imageUrl && (
                          <img
                            src={community.imageUrl}
                            alt={community.title}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-base md:text-lg truncate">
                              {community.title}
                            </h4>
                            <span className="px-2 md:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
                              {community.category}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2 md:mb-3">
                            {community.description}
                          </p>
                          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="truncate">{community.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{community.memberCount}/{community.maxMembers}명</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  onSearch,
  user,
  communities = [],
  onCommunityClick,
  onPaymentClick
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [aiSearchCount, setAiSearchCount] = useState(() => {
    const saved = localStorage.getItem('aiSearchCount');
    return saved ? parseInt(saved, 10) : 0;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const isPremiumUser = user?.isPremium || false;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // 모달이 열리면 자동으로 검색창에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      onClose();
    }
  };

  const handleAISearchClick = () => {
    // 검색 횟수 체크
    if (!isPremiumUser && aiSearchCount >= 3) {
      // 구독 유도 모달 표시 (간단하게 alert로 대체)
      if (onPaymentClick) {
        onClose();
        onPaymentClick();
      }
      return;
    }

    // AI 검색 모달 열기
    setIsAISearchOpen(true);
    
    // 검색 횟수 증가
    if (!isPremiumUser) {
      const newCount = aiSearchCount + 1;
      setAiSearchCount(newCount);
      localStorage.setItem('aiSearchCount', String(newCount));
    }
  };

  const handleAISearchClose = () => {
    setIsAISearchOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 일반 검색 모달 */}
      {!isAISearchOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* 검색 모달 */}
          <div className="fixed inset-x-0 top-0 bg-white z-50 md:hidden" style={{
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div className="p-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">모임 검색</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* 검색창 - 데스크탑과 동일한 디자인 */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="모임 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 pr-12 border rounded-full focus:outline-none transition-all border-gray-200 focus:ring-2 focus:ring-[#00A651]"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1 rounded-full transition-all hover:scale-110 bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg"
                      title="AI 검색"
                      onClick={handleAISearchClick}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <style>
            {`
              @keyframes slideDown {
                from {
                  transform: translateY(-100%);
                }
                to {
                  transform: translateY(0);
                }
              }
            `}
          </style>
        </>
      )}

      {/* AI 검색 모달 */}
      {isAISearchOpen && (
        <AISearchModal
          onClose={handleAISearchClose}
          onSearch={(query) => {
            onSearch(query);
            handleAISearchClose();
            onClose();
          }}
          isPremiumUser={isPremiumUser}
          aiSearchCount={aiSearchCount}
          onPaymentClick={onPaymentClick}
          communities={communities}
          onCommunityClick={(id) => {
            handleAISearchClose();
            onClose();
            onCommunityClick?.(id);
          }}
        />
      )}
    </>
  );
}