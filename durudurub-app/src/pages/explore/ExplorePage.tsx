import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Calendar, Star, ArrowLeft, X, LogIn, Plus } from 'lucide-react';


interface ExplorePageProps {
  onBack: () => void;
  onCommunityClick: (communityId: string) => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoClick: () => void;
  onNoticeClick: () => void;
  onMyPageClick: () => void;
  onMiniGameClick: () => void;
  onMyMeetingsClick: () => void;
  onPaymentClick?: () => void;
  onCreateClick?: () => void;
  onSearchClick?: (searchQuery?: string) => void;
  user: any;
  accessToken: string | null;
  profileImage: string | null;
  onLogout: () => void;
  initialSearchQuery?: string;
  initialCategory?: string;
}

const categories = [
  { id: 'all', name: '전체', icon: '🔍' },
  { id: '자기계발', name: '자기계발', icon: '📖' },
  { id: '스포츠', name: '스포츠', icon: '⚽' },
  { id: '푸드', name: '푸드', icon: '🍳' },
  { id: '게임', name: '게임', icon: '🎮' },
  { id: '동네친구', name: '동네친구', icon: '👋' },
  { id: '여행', name: '여행', icon: '✈️' },
  { id: '예술', name: '예술', icon: '🎨' },
  { id: '기타', name: '기타', icon: '🌟' }
];

const DEFAULT_MEETING_IMAGE = '/uploads/profile/Durub_Default.png';

const normalizeMeetingImageUrl = (thumbnailImg?: string) => {
  if (!thumbnailImg || thumbnailImg.trim() === '') {
    return DEFAULT_MEETING_IMAGE;
  }

  if (thumbnailImg.startsWith('http://') || thumbnailImg.startsWith('https://') || thumbnailImg.startsWith('/')) {
    return thumbnailImg;
  }

  return `/uploads/clubs/${thumbnailImg}`;
};

export function ExplorePage({ onBack, onCommunityClick, onLoginClick, onSignupClick, onLogoClick, onNoticeClick, onMyPageClick, onMiniGameClick, onMyMeetingsClick, onPaymentClick, onCreateClick, onSearchClick, user, accessToken, profileImage, onLogout, initialSearchQuery, initialCategory }: ExplorePageProps) {
  const [communities, setCommunities] = useState<any[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchTerm, setSearchTerm] = useState(typeof initialSearchQuery === 'string' ? initialSearchQuery : '');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [brokenHostImages, setBrokenHostImages] = useState<Set<string>>(new Set());
  const [brokenMeetingImages, setBrokenMeetingImages] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular' | 'name'>('latest');

  useEffect(() => {
    loadCommunities()
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [communities, selectedCategory, searchTerm]);

  useEffect(() => {
    setSearchTerm(typeof initialSearchQuery === 'string' ? initialSearchQuery : '');
  }, [initialSearchQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
  }, [initialCategory]);

  useEffect(() => {
    if (!user || communities.length === 0) {
      return;
    }

    let isCancelled = false;

    const syncFavorites = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const likedEntries = await Promise.all(
          communities.map(async (community) => {
            try {
              const res = await fetch(`/api/likes/club/${community.no}`, { headers });
              if (!res.ok) {
                return [String(community.no), Boolean(community.liked)] as const;
              }

              const data = await res.json();
              return [String(community.no), Boolean(data.liked)] as const;
            } catch {
              return [String(community.no), Boolean(community.liked)] as const;
            }
          })
        );

        if (isCancelled) return;

        const nextFavorites = new Set<string>();
        likedEntries.forEach(([id, liked]) => {
          if (liked) {
            nextFavorites.add(id);
          }
        });
        setFavorites(nextFavorites);
      } catch (error) {
        console.error('즐겨찾기 상태 동기화 실패 : ', error);
      }
    };

    void syncFavorites();

    return () => {
      isCancelled = true;
    };
  }, [user, communities]);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/clubs', { headers });
      const data = await res.json();
      setCommunities(data.clubs || [])
    } catch (error) {
      console.error('커뮤니티 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  };

  // HTML 태그 제거 헬퍼
  const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '');

  const filterCommunities = () => {
    let filtered = communities;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category?.name === selectedCategory);
    }

    // 검색어 필터
    if (searchTerm && typeof searchTerm === 'string') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.title || '').toLowerCase().includes(lowerSearchTerm) ||
        stripHtml(c.description).toLowerCase().includes(lowerSearchTerm) ||
        (c.location || '').toLowerCase().includes(lowerSearchTerm)
      );
    }

    const getMemberNickname = (member: any): string => {
      if (!member) return '';
      return (
        member.user?.username ||
        member.user?.nickname ||
        member.user?.name ||
        member.nickname ||
        member.username ||
        member.name ||
        ''
      );
    };

    const getMemberProfileImg = (member: any): string => {
      if (!member) return '';
      return (
        member.user?.profileImg ||
        member.profileImg ||
        ''
      );
    };

    // 각 community의 host를 우선 host_no로 찾고, 없으면 clubMembers의 첫 번째 멤버로 지정
    const filteredWithHost = filtered.map((community) => {
      let hostNickname =
        community.host?.username ||
        community.host?.nickname ||
        community.host?.name ||
        '';
      let hostProfileImg =
        community.host?.profileImg ||
        '';

      if (Array.isArray(community.clubMembers) && community.clubMembers.length > 0) {
        const hostMemberByHostNo = community.host_no
          ? community.clubMembers.find((member) => String(member.user_no) === String(community.host_no))
          : undefined;

        const fallbackFirstMember = community.clubMembers[0];
        const selectedHostMember = hostMemberByHostNo || fallbackFirstMember;
        const selectedNickname = getMemberNickname(selectedHostMember);
        const selectedProfileImg = getMemberProfileImg(selectedHostMember);

        if (selectedNickname.trim() !== '') {
          hostNickname = selectedNickname;
        }

        if (selectedProfileImg.trim() !== '') {
          hostProfileImg = selectedProfileImg;
        }
      }

      const host = {
        ...(community.host || {}),
        nickname: hostNickname,
        profileImg: hostProfileImg
      };

      return {
        ...community,
        host
      };
    });

    setFilteredCommunities(filteredWithHost);
  };

  const toggleFavorite = async (communityId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) { setLoginModalMessage('즐겨찾기 기능을 사용하려면 로그인해주세요'); setShowLoginModal(true); return; }
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/likes/club/${communityId}`, { method: 'POST', headers });
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      const nextLiked = Boolean(data.liked);

      setFavorites((prev) => {
        const next = new Set(prev);
        if (nextLiked) {
          next.add(communityId);
        } else {
          next.delete(communityId);
        }
        return next;
      });

      setCommunities((prev) =>
        prev.map((community) =>
          String(community.no) === communityId
            ? { ...community, liked: nextLiked }
            : community
        )
      );
    } catch (e) {
      console.error('즐겨찾기 반영 실패 : ', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 뒤로가기 버튼 */}
      <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center justify-center text-gray-700 hover:text-[#00A651] transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* 카테고리 필터 */}
        <div className="mb-8">
          {/* 모바일: 드롭다운 */}
          <div className="md:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-[#00A651] transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '40px'
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 데스크톱: 버튼 그리드 */}
          <div className="hidden md:flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[#00A651] text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 개수 + 모임 만들기 버튼 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? '로딩 중...' : `${filteredCommunities.length}개의 모임 (최신순)`}
          </p>
          <button
            onClick={() => {
              if (!user) {
                setLoginModalMessage('모임을 만드시려면 로그인해주세요');
                setShowLoginModal(true);
              } else {
                onCreateClick?.();
              }
            }}
            className="flex items-center gap-2 bg-[#00A651] text-white font-bold px-6 py-3 rounded-full hover:bg-[#008E41] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>모임 만들기</span>
          </button>
        </div>

        {/* 모임 카드 그리드 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#00A651]"></div>
            <p className="mt-4 text-gray-600">모임을 불러오는 중...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 mb-2">검색 결과가 없습니다</p>
            <p className="text-gray-500">다른 검색어나 카테고리를 시도해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => {
              const communityId = String(community.no);
              const hostNickname = (community.host?.nickname || '').trim();
              const hostInitial = hostNickname ? hostNickname.charAt(0) : '?';
              const hostProfileImg = (community.host?.profileImg || '').trim();
              const canShowHostProfileImg = hostProfileImg !== '' && !brokenHostImages.has(communityId);
              const thumbnailSrc = brokenMeetingImages.has(communityId)
                ? DEFAULT_MEETING_IMAGE
                : normalizeMeetingImageUrl(community.thumbnailImg);

              return (
              <div
                key={community.no}
                onClick={() => onCommunityClick(communityId)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#00A651] transform hover:-translate-y-1"
              >
                {/* 데스크톱 버전 - 세로형 레이아웃 */}
                <div className="hidden md:block">
                  {/* 이미지 */}
                  <div className="relative h-48 bg-gradient-to-br from-[#00A651]/10 to-[#00A651]/20 flex items-center justify-center">
                    <img
                      src={thumbnailSrc}
                      alt={community.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setBrokenMeetingImages((prev) => {
                          const next = new Set(prev);
                          next.add(communityId);
                          return next;
                        });
                      }}
                    />
                    
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={(e) => toggleFavorite(communityId, e)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.has(String(community.no))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 내용 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-[#00A651]/10 text-[#00A651] text-xs font-semibold rounded-full">
                        {community.category?.name}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {community.currentMembers}/{community.maxMembers}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {community.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {stripHtml(community.description)}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{community.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        {canShowHostProfileImg ? (
                          <img
                            src={hostProfileImg}
                            alt={hostNickname || '리더'}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={() => {
                              setBrokenHostImages((prev) => {
                                const next = new Set(prev);
                                next.add(communityId);
                                return next;
                              });
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-[#00A651] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {hostInitial}
                          </div>
                        )}
                        <span className="ml-2 text-sm text-gray-700 font-medium">
                          {`${hostNickname || '알 수 없음'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모바일 버전 - 가로형 레이아웃 */}
                <div className="md:hidden flex gap-3 p-3 min-h-[120px] items-stretch">
                  {/* 왼쪽: 썸네일 */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#00A651]/10 to-[#00A651]/20 flex items-center justify-center">
                    <img
                      src={thumbnailSrc}
                      alt={community.title}
                      className="w-full h-full object-cover object-center scale-110"
                      onError={() => {
                        setBrokenMeetingImages((prev) => {
                          const next = new Set(prev);
                          next.add(communityId);
                          return next;
                        });
                      }}
                    />
                    
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={(e) => toggleFavorite(communityId, e)}
                      className="absolute top-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.has(String(community.no))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 오른쪽: 정보 */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* 제목 */}
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                      {community.title}
                    </h3>

                    {/* 설명 */}
                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                      {stripHtml(community.description)}
                    </p>

                    {/* 장소 */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{community.location}</span>
                    </div>

                    {/* 리더 정보와 인원 수 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        {canShowHostProfileImg ? (
                          <img
                            src={hostProfileImg}
                            alt={hostNickname || '리더'}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            onError={() => {
                              setBrokenHostImages((prev) => {
                                const next = new Set(prev);
                                next.add(communityId);
                                return next;
                              });
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                            {hostInitial}
                          </div>
                        )}
                        <span className="ml-1.5 text-xs text-gray-700 font-medium truncate">
                          {`${hostNickname || '알 수 없음'}`}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
                        <Users className="w-3 h-3 mr-1" />
                        {community.currentMembers}/{community.maxMembers}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-[#00A651]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-600 mb-6">
                {loginModalMessage || '로그인해주세요'}
              </p>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  onLoginClick();
                }}
                className="w-full bg-[#00A651] text-white py-3 rounded-lg font-semibold hover:bg-[#008E41] transition-colors"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}