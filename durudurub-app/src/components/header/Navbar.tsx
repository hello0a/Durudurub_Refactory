import { Menu, X, User, Bell, Gamepad2, Shield, Search, Sparkles, MapPin, Users } from 'lucide-react';
import { DurupLogo } from '@/character/DurupLogo';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

// Navbar 컴포넌트가 받을 수 있는 함수 목록 정의
interface NavbarProps {
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onNoticeClick?: () => void;
  onMyPageClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  onAdminClick?: () => void;
  onPaymentClick?: () => void;
  onExploreClick?: (searchQuery?: string) => void;
  onCommunityClick?: (communityId: string) => void;
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
  user?: any;
  profileImage?: string | null;
  onLogout?: () => void;
}

// AI 검색 모달 컴포넌트
function AISearchModal({ 
  onClose, 
  onSearch, 
  isPremiumUser, 
  aiSearchCount,
  onPaymentClick,
  onCommunityClick,
  onUpdateSearchCount,
}: { 
  onClose: () => void; 
  onSearch: (query: string) => void; 
  isPremiumUser: boolean;
  aiSearchCount: number;
  onPaymentClick?: () => void;
  onCommunityClick?: (communityId: string) => void;
  onUpdateSearchCount?: (remaining: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [remaining, setRemaining] = useState(isPremiumUser ? -1 : Math.max(0, 3 - aiSearchCount));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!isPremiumUser && remaining === 0) return;

    setIsLoading(true);
    setHasSearched(true);
    setAiMessage('');
    setSearchResults([]);

    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.clubs || []);
        setAiMessage(data.aiMessage || '');
        if (data.remaining != null) {
          setRemaining(data.remaining);
          onUpdateSearchCount?.(data.remaining);
        }
        onSearch(searchQuery);
      } else {
        const errText = await res.text();
        setAiMessage(errText || 'AI 검색에 실패했습니다.');
      }
    } catch {
      setAiMessage('AI 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityClick = (communityId: string) => {
    onClose();
    onCommunityClick?.(communityId);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full relative animate-fade-in shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 헤더 */}
        <div className="bg-white rounded-t-2xl p-8 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI 검색</h2>
            </div>
            
            {/* 검색 횟수 표시 */}
            {!isPremiumUser && (
              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {remaining}/3 남음
              </span>
            )}
            
            {isPremiumUser && (
              <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full text-sm font-semibold">
                무제한
              </span>
            )}
          </div>
        </div>

        {/* 검색 입력 영역 */}
        <div className="p-8 flex-shrink-0">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="예: 서울에서 매주 주말에 하는 독서 모임을 찾고 싶어요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  autoFocus
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* 검색 버튼 */}
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim() || (!isPremiumUser && remaining === 0)}
                className={`w-full px-8 py-4 rounded-xl font-bold text-white transition-all whitespace-nowrap shadow-lg ${
                  isLoading || !searchQuery.trim() || (!isPremiumUser && remaining === 0)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 hover:shadow-xl'
                }`}
              >
                {isLoading ? 'AI가 검색 중...' : 'AI로 검색하기'}
              </button>
            </div>
          </form>

          {/* 검색 전 안내 텍스트 */}
          {!hasSearched && !isLoading && (
            <p className="text-gray-600 text-center mt-4">원하는 모임을 검색하세요!</p>
          )}

          {/* 로딩 표시 */}
          {isLoading && (
            <div className="flex items-center justify-center mt-6 gap-3">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-purple-600 font-medium">AI가 모임을 찾고 있어요...</span>
            </div>
          )}

          {/* 검색 횟수 소진 안내 */}
          {!isPremiumUser && remaining === 0 && (
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
        {/* AI 추천 메시지 */}
        {aiMessage && !isLoading && (
          <div className="px-8 pb-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-800 whitespace-pre-line">{aiMessage}</p>
              </div>
            </div>
          </div>
        )}

        {hasSearched && !isLoading && (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="pt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
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
                  {searchResults.map((club: any) => (
                    <div
                      key={club.no}
                      onClick={() => handleCommunityClick(String(club.no))}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex gap-4">
                        {club.thumbnailImg && (
                          <img
                            src={club.thumbnailImg.startsWith('/') ? club.thumbnailImg : `/uploads/clubs/${club.thumbnailImg}`}
                            alt={club.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg truncate">
                              {club.title}
                            </h4>
                            {club.category?.name && (
                              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
                                {club.category.name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {club.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {club.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{club.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{club.currentMembers}/{club.maxMembers}명</span>
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

// 구독 모달 컴포넌트
function SubscriptionModal({ onClose, onPaymentClick }: { onClose: () => void; onPaymentClick?: () => void }) {
  const handleSubscribe = () => {
    onClose();
    if (onPaymentClick) {
      onPaymentClick();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* AI 아이콘 */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            AI 검색 무료 체험 종료
          </h2>
          <p className="text-gray-600 mb-6">
            무료 AI 검색 3회를 모두 사용하셨습니다.<br />
            프리미엄 구독으로 무제한 AI 검색을 이용해보세요!
          </p>

          {/* 프리미엄 혜택 */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-purple-900 mb-3">프리미엄 혜택</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>무제한 AI 검색 기능</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>개인화된 모임 추천</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>광고 없는 깨끗한 환경</span>
              </li>
            </ul>
          </div>

          {/* 가격 정보 */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-purple-600">₩4,900</div>
            <div className="text-sm text-gray-500">월 구독</div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
            >
              나중에
            </button>
            <button
              onClick={handleSubscribe}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full hover:from-purple-600 hover:to-purple-800 transition-all font-medium shadow-lg"
            >
              구독하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 로그인 유도 모달 컴포넌트
function LoginRequiredModal({ onClose, onLoginClick }: { onClose: () => void; onLoginClick?: () => void }) {
  const handleLogin = () => {
    onClose();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* AI 아이콘 */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            AI 검색 기능은 로그인 후 이용하실 수 있습니다.<br />
            로그인하시면 무료로 3회까지 AI 검색을 체험하실 수 있어요!
          </p>

          {/* AI 검색 혜택 */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-purple-900 mb-3">AI 검색으로 이런 것들이 가능해요</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>원하는 모임 찾기</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>맞춤형 모임 추천받기</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>로그인 후 무료 3회 체험</span>
              </li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full hover:from-purple-600 hover:to-purple-800 transition-all font-medium shadow-lg"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar({ onSignupClick, onLoginClick, onLogoClick, onNoticeClick, onMyPageClick, onMiniGameClick, onMyMeetingsClick, onAdminClick, onPaymentClick, onExploreClick, onCommunityClick, communities, user: userProp, profileImage: profileImageProp, onLogout: onLogoutProp }: NavbarProps) {
  const { user: contextUser, profileImage: contextProfileImage, handleLogout } = useApp();
  const user = contextUser || userProp;
  const profileImage = contextProfileImage || profileImageProp;
  const onLogout = onLogoutProp || handleLogout;
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [aiSearchCount, setAiSearchCount] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  // 구독 여부 확인 (user 객체에 isPremium 또는 subscription 필드가 있다고 가정)
  const isPremiumUser = user?.isPremium === true || user?.subscription === 'premium';

  // 일반 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('일반 검색:', searchQuery);
      onExploreClick?.(searchQuery);
    }
  };

  // AI 검색 핸들러
  const handleAISearch = (query: string) => {
    // 구독하지 않은 유저의 경우 3회 제한
    if (!isPremiumUser && aiSearchCount >= 3) {
      setShowSubscriptionModal(true);
      return;
    }

    console.log('AI 검색:', query);
    
    // AI 검색 횟수 증가 (구독 유저가 아닌 경우만)
    if (!isPremiumUser) {
      setAiSearchCount(prev => prev + 1);
    }

    // 검색은 모달 내부에서 처리하므로 여기서는 아무것도 하지 않음
    // onExploreClick?.(query); 제거
  };

  // AI 검색 버튼 클릭 핸들러
  const openAISearchModal = () => {
    // 미로그인 유저가 AI 검색을 하려고 하면 로그인 유도 모달 표시
    if (!user) {
      setShowLoginRequiredModal(true);
      return;
    }
    setShowAISearchModal(true);
  };

  const handleUserMenuClick = (action: string) => {

    if (!user) {
      // 로그인이 안 되어 있으면 회원가입 페이지로
      onSignupClick?.();
    } else {
      // 로그인이 되어 있으면 각 액션 실행
      if (action === 'logout') {
        onLogout?.();
      } else if (action === 'mypage') {
        onMyPageClick?.();
      } else if (action === 'myMeetings') {
        console.log("=====================");
        onMyMeetingsClick?.();
      } else if (action === 'admin') {
        console.log("++++++++++++++++ admin");

        if (onAdminClick) {
          onAdminClick();
        } else {
          navigate("/admin")
        }
        onAdminClick?.();
      } else if (action === 'notice') {
        onNoticeClick?.();
      } else {
        console.log(action);
      }
    }
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // 관리자 계정 여부 확인
  const isAdmin = user?.isAdmin === true || user?.userId === 'admin';

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as HTMLElement;
        // 드롭다운 메뉴나 유저 아이콘을 클릭한 경우가 아니라면 닫기
        if (!target.closest('.user-menu-container')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <>
      <div className="h-25" aria-hidden="true" />
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-25">
          {/* 로고 */}
          <div className="flex-shrink-0 cursor-pointer" onClick={onLogoClick}>
            <DurupLogo size="md" />
          </div>

          {/* 중앙 검색창 */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
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
                    onClick={openAISearchModal}
                    className="p-1 rounded-full transition-all hover:scale-110 bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg"
                    title="AI 검색"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 오른쪽 메뉴 */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 미니 게임 버튼 (모든 사용자에게 표시) */}
            <button
              className="text-lg border-2 border-[#00A651] text-[#00A651] px-6 py-2.5 rounded-full hover:bg-[#00A651] hover:text-white transition-colors font-medium flex items-center gap-2"
              onClick={onMiniGameClick}
            >
              <Gamepad2 className="w-5 h-5" />
              미니게임
            </button>

            {user && (
              <>
                <div className="relative user-menu-container">
                  <button
                    className="text-gray-700 hover:text-[#00A651] transition-colors flex items-center justify-center"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-10 h-10"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {/* 관리자만 공지사항 메뉴 표시 */}
                      {/* {isAdmin && ( */}
                        <button
                          onClick={() => handleUserMenuClick('notice')}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00A651] transition-colors flex items-center gap-2"
                        >
                          <Bell className="w-5 h-5" />
                          공지사항
                        </button>
                      {/* )} */}
                      {/* 관리자가 아닌 경우에만 마이페이지와 내 모임 표시 */}
                      {!isAdmin && (
                        <>
                          <button
                            onClick={() => handleUserMenuClick('mypage')}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00A651] transition-colors"
                          >
                            마이페이지
                          </button>
                          <button
                            onClick={() => handleUserMenuClick('myMeetings')}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00A651] transition-colors"
                          >
                            내 모임
                          </button>
                          {/* @공지사항 메뉴 추가하기@ */}
                        </>
                      )}
                      {/* 관리자만 관리자 페이지 메뉴 표시 */}
                      {isAdmin && (
                        <button
                          onClick={() => handleUserMenuClick('admin')}
                          className="w-full text-left px-4 py-2 text-purple-600 hover:bg-gray-50 transition-colors"
                        >
                          관리자 페이지
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => handleUserMenuClick('logout')}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user && (
              <>
                <button
                  className="text-lg border-2 border-[#00A651] text-[#00A651] px-6 py-2.5 rounded-full hover:bg-[#00A651] hover:text-white transition-colors"
                  onClick={onSignupClick}
                >
                  회원가입
                </button>
                <button
                  className="text-lg bg-[#00A651] text-white px-6 py-2.5 rounded-full hover:bg-[#008f46] transition-colors"
                  onClick={onLoginClick}
                >
                  로그인
                </button>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-100">
            {/* 모바일 검색창 */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
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
                    onClick={openAISearchModal}
                    className="p-1 rounded-full transition-all hover:scale-110 bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg"
                    title="AI 검색"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* 미니게임 버튼 (모바일) */}
            <button
              className="flex items-center text-gray-700 hover:text-[#00A651] py-2 w-full text-left"
              onClick={onMiniGameClick}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              미니게임
            </button>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              {user ? (
                <>
                  {/* 관리자가 아닌 경우에만 마이페이지와 내 모임 표시 */}
                  {!isAdmin && (
                    <>
                      <button
                        className="flex items-center text-gray-700 hover:text-[#00A651] py-2 w-full text-left"
                        onClick={() => handleUserMenuClick('mypage')}
                      >
                        <User className="w-5 h-5 mr-2" />
                        마이페이지
                      </button>
                      <button
                        className="flex items-center text-gray-700 hover:text-[#00A651] py-2 w-full text-left"
                        onClick={() => handleUserMenuClick('myMeetings')}
                      >
                        내 모임
                      </button>
                    </>
                  )}
                  {/* 관리자만 관리자 페이지 메뉴 표시 */}
                  {isAdmin && (
                    <>
                      <button
                        className="flex items-center text-gray-700 hover:text-[#00A651] py-2 w-full text-left"
                        onClick={onNoticeClick}
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        공지사항
                      </button>
                      <button
                        className="flex items-center text-purple-600 hover:text-purple-700 py-2 w-full text-left"
                        onClick={() => handleUserMenuClick('admin')}
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        관리자 페이지
                      </button>
                    </>
                  )}
                  <button
                    className="w-full text-left py-2 text-red-600 hover:text-red-700"
                    onClick={() => handleUserMenuClick('logout')}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full border-2 border-[#00A651] text-[#00A651] px-5 py-2 rounded-full hover:bg-[#00A651] hover:text-white transition-colors"
                    onClick={onSignupClick}
                  >
                    회원가입
                  </button>
                  <button
                    className="w-full bg-[#00A651] text-white px-5 py-2 rounded-full hover:bg-[#008f46] transition-colors"
                    onClick={onLoginClick}
                  >
                    로그인
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI 검색 모달 */}
      {showAISearchModal && <AISearchModal onClose={() => setShowAISearchModal(false)} onSearch={handleAISearch} isPremiumUser={isPremiumUser} aiSearchCount={aiSearchCount} onPaymentClick={onPaymentClick} onCommunityClick={onCommunityClick} onUpdateSearchCount={(r) => setAiSearchCount(3 - r)} />}
      {/* 구독 유도 모달 */}
      {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} onPaymentClick={onPaymentClick} />}
      {/* 로그인 유도 모달 */}
      {showLoginRequiredModal && <LoginRequiredModal onClose={() => setShowLoginRequiredModal(false)} onLoginClick={onLoginClick} />}
      </nav>
    </>
  );
}