import { Star, ArrowLeft, Users, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FavoritesPageProps {
  onBack: () => void;
  user: any;
  accessToken?: string | null;
  profileImage?: string | null;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onNoticeClick?: () => void;
  onMyPageClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  onLogout?: () => void;
  onCommunityClick?: (communityNo: number) => void;
  onExploreClick?: () => void;
}

type Category = {
  name: string;
};

interface Community {
  no: number;
  title: string;
  description: string;
  category: Category;
  location: string;
  hostId: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
  thumbnailImg?: string;
  createdAt: string;
}

export function FavoritesPage({
  onBack,
  user,
  accessToken,
  profileImage,
  onSignupClick,
  onLoginClick,
  onLogoClick,
  onNoticeClick,
  onMyPageClick,
  onMiniGameClick,
  onMyMeetingsClick,
  onLogout,
  onCommunityClick,
  onExploreClick,
}: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string,string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/users/mypage/favorites`, { headers });
      console.log("res ??? ", res);
      const favoritesDate = await res.json();
      console.log("userData ??? ", favoritesDate)
      setFavorites(favoritesDate || []);
    } catch (error) {
      console.error('즐겨찾기 목록을 불러오는 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (communityNo: number) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`/api/likes/club/${communityNo}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // liked가 false이면 즐겨찾기 해제된 것 → 목록에서 제거
        if (!data.liked) {
          setFavorites((prev) => prev.filter((c) => c.no !== communityNo));
        }
      }
    } catch (error) {
      console.error('즐겨찾기 제거 중 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* 모바일 헤더 (뒤로가기 버튼 + 제목) */}
      <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center justify-center text-gray-700 hover:text-[#00A651] transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#00A651] animate-spin mb-4" />
            <p className="text-gray-600">즐겨찾기 목록을 불러오는 중...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              즐겨찾기한 모임이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              관심있는 모임을 즐겨찾기에 추가해보세요!
            </p>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-[#00A651] text-white rounded-lg hover:bg-[#008f46] transition-colors font-medium"
            >
              모임 둘러보기
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                총 <span className="font-bold text-[#00A651]">{favorites.length}개</span>의
                모임을 즐겨찾기했습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((community) => (
                <div
                  key={community.no}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  {/* 데스크톱 버전 - 세로형 레이아웃 */}
                  <div className="hidden md:flex flex-col h-full">
                    {/* 커뮤니티 이미지 */}
                    <div className="relative h-48 bg-gradient-to-br from-[#00A651] to-[#008f46]">
                      {community.thumbnailImg ? (
                        <img
                          src={community.thumbnailImg}
                          alt={community.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {community.title.charAt(0)}
                        </div>
                      )}
                      {/* 즐겨찾기 버튼 */}
                      <button
                        onClick={() => handleRemoveFavorite(community.no)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </button>
                    </div>

                    {/* 커뮤니티 정보 */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-[#00A651]/10 text-[#00A651] rounded-full text-sm font-medium mb-3">
                          {community.category?.name}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {community.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {community.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 mt-auto">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {community.currentMembers}/{community.maxMembers}명
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onCommunityClick?.(community.no)}
                        className="w-full py-3 bg-[#00A651] text-white rounded-lg hover:bg-[#008f46] transition-colors font-medium"
                      >
                        모임 보기
                      </button>
                    </div>
                  </div>

                  {/* 모바일 버전 - 가로형 레이아웃 */}
                  <div className="md:hidden flex gap-3 p-3">
                    {/* 왼쪽: 썸네일 */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#00A651] to-[#008f46]">
                      {community.thumbnailImg ? (
                        <img
                          src={community.thumbnailImg}
                          alt={community.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                          {community.title.charAt(0)}
                        </div>
                      )}
                      
                      {/* 즐겨찾기 버튼 */}
                      <button
                        onClick={() => handleRemoveFavorite(community.no)}
                        className="absolute top-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </button>
                    </div>

                    {/* 오른쪽: 정보 */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      {/* 상단: 제목과 설명 */}
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-[#00A651]/10 text-[#00A651] rounded-full text-[10px] font-medium mb-1">
                          {community.category?.name}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                          {community.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {community.description}
                        </p>
                      </div>

                      {/* 하단: 인원수와 버튼 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          {community.currentMembers}/{community.maxMembers}
                        </div>
                        <button
                          onClick={() => onCommunityClick?.(community.no)}
                          className="px-3 py-1.5 bg-[#00A651] text-white rounded-lg text-xs font-medium hover:bg-[#008f46] transition-colors flex-shrink-0"
                        >
                          보기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}