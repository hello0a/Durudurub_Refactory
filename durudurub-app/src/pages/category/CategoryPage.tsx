import { ArrowLeft, Star, MapPin, Calendar, Users, X, Lock, Plus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import api from '@/api/axios';

interface CategoryPageProps {
  category: string;
  onBack: () => void;
  user: any;
  onSignupClick: () => void;
  onMeetingClick: (meeting: Meeting) => void;
  onLoginClick?: () => void;
  onCreateClick?: () => void;
  onLogoClick?: () => void;
  onMyPageClick?: () => void;
}

interface Meeting {
  id: number;
  title: string;
  image: string;
  host: string;
  location: string;
  date: string;
  participants: number;
  maxParticipants: number;
  liked: boolean;
  subCategoryNo?: number;
}

interface ApiCategory {
  no: number;
  name: string;
}

interface ApiSubCategory {
  no: number;
  name: string;
}

interface ApiClub {
  no: number;
  title?: string;
  description?: string;
  location?: string;
  thumbnailImg?: string;
  currentMembers?: number;
  maxMembers?: number;
  liked?: boolean;
  hostName?: string;
  hostUserId?: string;
  clubDate?: string;
  createdAt?: string;
  subCategoryNo?: number;
  subCategoryName?: string;
}

const extractArray = <T,>(payload: unknown, candidateKeys: string[]): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    for (const key of candidateKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  return [];
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop';

const normalizeImageUrl = (thumbnailImg?: string) => {
  if (!thumbnailImg) {
    return PLACEHOLDER_IMAGE;
  }

  if (thumbnailImg.startsWith('http://') || thumbnailImg.startsWith('https://')) {
    return thumbnailImg;
  }

  if (thumbnailImg.startsWith('/')) {
    return thumbnailImg;
  }

  return `/uploads/clubs/${thumbnailImg}`;
};

const formatMeetingDate = (value?: string) => {
  if (!value) {
    return '일정 미정';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function CategoryPage({ category, onBack, user, onSignupClick, onMeetingClick, onLoginClick, onCreateClick, onLogoClick, onMyPageClick }: CategoryPageProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<ApiSubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<number | null>(null);
  const [selectedSubcategoryNo, setSelectedSubcategoryNo] = useState<string>('all');
  const [resolvedCategoryNo, setResolvedCategoryNo] = useState<number | null>(null);

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    let isCancelled = false;

    const resolveCategoryNo = async () => {
      const numericCategoryNo = Number(category);
      if (!Number.isNaN(numericCategoryNo) && numericCategoryNo > 0) {
        return numericCategoryNo;
      }

      const categoriesRes = await api.get<ApiCategory[]>('/api/clubs/categories');
      const matchedCategory = categoriesRes.data?.find((item) => item.name === category);
      return matchedCategory?.no ?? null;
    };

    const fetchCategoryBaseData = async () => {
      setLoadError(null);
      setSelectedSubcategoryNo('all');
      setMeetings([]);

      try {
        const categoryNo = await resolveCategoryNo();

        if (!categoryNo) {
          if (!isCancelled) {
            setResolvedCategoryNo(null);
            setApiSubcategories([]);
            setLoadError('카테고리를 찾을 수 없습니다.');
          }
          return;
        }

        let subCategoriesData: ApiSubCategory[] = [];

        const subCategoriesRes = await api.get<ApiSubCategory[]>(`/api/clubs/subcategories/${categoryNo}`);
        subCategoriesData = extractArray<ApiSubCategory>(subCategoriesRes.data, ['subCategories', 'categories', 'data', 'list', 'items']);

        if (!isCancelled) {
          setResolvedCategoryNo(categoryNo);
          setApiSubcategories(subCategoriesData);
        }
      } catch (error) {
        console.error('카테고리 기본 데이터 조회 실패:', error);
        if (!isCancelled) {
          setResolvedCategoryNo(null);
          setMeetings([]);
          setApiSubcategories([]);
          setLoadError('카테고리 정보를 불러오지 못했습니다.');
        }
      }
    };

    void fetchCategoryBaseData();

    return () => {
      isCancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!resolvedCategoryNo) {
      return;
    }

    let isCancelled = false;

    const fetchMeetings = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const params: Record<string, number> = {
          category: resolvedCategoryNo,
        };

        if (selectedSubcategoryNo !== 'all') {
          const subNo = Number(selectedSubcategoryNo);
          if (!Number.isNaN(subNo) && subNo > 0) {
            params.sub = subNo;
          }
        }

        const clubsRes = await api.get('/api/clubs', { params });
        const clubsData = extractArray<ApiClub>(clubsRes.data, ['clubs', 'data', 'list', 'items']);

        const mappedMeetings: Meeting[] = clubsData.map((club) => ({
          id: club.no,
          title: club.title || '제목 없음',
          image: normalizeImageUrl(club.thumbnailImg),
          host: club.hostName || club.hostUserId || '모임장',
          location: club.location || '장소 미정',
          date: formatMeetingDate(club.clubDate || club.createdAt),
          participants: club.currentMembers || 0,
          maxParticipants: club.maxMembers || 0,
          liked: Boolean(club.liked),
          subCategoryNo: club.subCategoryNo,
        }));

        if (!isCancelled) {
          setMeetings(mappedMeetings);
        }
      } catch (error) {
        console.error('모임 목록 조회 실패:', error);
        if (!isCancelled) {
          setMeetings([]);
          setLoadError('모임 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchMeetings();

    return () => {
      isCancelled = true;
    };
  }, [resolvedCategoryNo, selectedSubcategoryNo]);

  useEffect(() => {
    if (!user || meetings.length === 0) {
      return;
    }

    let isCancelled = false;

    const syncLikeStatuses = async () => {
      try {
        const likeStatusEntries = await Promise.all(
          meetings.map(async (meeting) => {
            try {
              const token = sessionStorage.getItem('accessToken');
              const headers: Record<string, string> = {};
              if (token) {
                headers.Authorization = `Bearer ${token}`;
              }

              const res = await fetch(`/api/likes/club/${meeting.id}`, {
                headers,
              });

              if (!res.ok) {
                return [meeting.id, meeting.liked] as const;
              }

              const data = await res.json();
              return [meeting.id, Boolean(data.liked)] as const;
            } catch {
              return [meeting.id, meeting.liked] as const;
            }
          })
        );

        if (isCancelled) {
          return;
        }

        const likedMap = new Map<number, boolean>(likeStatusEntries);
        setMeetings((prev) => {
          let hasChanged = false;

          const next = prev.map((meeting) => {
            const syncedLiked = likedMap.get(meeting.id) ?? meeting.liked;
            if (syncedLiked !== meeting.liked) {
              hasChanged = true;
              return { ...meeting, liked: syncedLiked };
            }
            return meeting;
          });

          return hasChanged ? next : prev;
        });
      } catch (error) {
        console.error('즐겨찾기 상태 동기화 실패:', error);
      }
    };

    void syncLikeStatuses();

    return () => {
      isCancelled = true;
    };
  }, [user, meetings]);

  // 선택된 소분류에 따라 모임 필터링
  const filteredMeetings = selectedSubcategoryNo === 'all' 
    ? meetings 
    : meetings.filter(meeting => String(meeting.subCategoryNo) === selectedSubcategoryNo);

  const handleLikeClick = async (e: React.MouseEvent, meetingId: number) => {
    e.stopPropagation();
    
    // 비로그인 상태면 로그인 모달 표시
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/likes/club/${meetingId}`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      const nextLiked = Boolean(data.liked);

      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === meetingId
            ? { ...meeting, liked: nextLiked }
            : meeting
        )
      );
    } catch (error) {
      console.error('즐겨찾기 처리 실패:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, meetingId: number) => {
    e.stopPropagation();
    setMeetingToDelete(meetingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (meetingToDelete !== null) {
      // TODO: 백엔드 API 연결하여 실제 삭제 처리
      console.log(`삭제할 모임 ID: ${meetingToDelete}`);
      alert('모임이 삭제되었습니다.');
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-[#FBF7F0] py-12 relative">
        {/* 모바일 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="md:hidden absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="pl-12 md:pl-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{category}</h1>
              <p className="text-gray-600">
                {category}와 관련된 다양한 모임을 만나보세요
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  onCreateClick?.();
                }
              }}
              className="flex items-center gap-2 bg-[#00A651] text-white font-bold px-6 py-3 rounded-full hover:bg-[#008E41] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">모임 만들기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 모임 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* 소분류 카테고리 필터 */}
        <div className="mb-8">
          {/* 모바일: 드롭다운 */}
          <div className="sm:hidden">
            <select
              value={selectedSubcategoryNo}
              onChange={(e) => setSelectedSubcategoryNo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-[#00A651] transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '40px'
              }}
            >
              <option value="all">전체</option>
              {apiSubcategories.map((subcategory) => (
                <option key={subcategory.no} value={String(subcategory.no)}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* 데스크톱: 가로 스크롤 버튼 */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="flex gap-3 pb-2">
              <button
                key="all"
                onClick={() => setSelectedSubcategoryNo('all')}
                className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedSubcategoryNo === 'all'
                    ? 'bg-[#00A651] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {apiSubcategories.map((subcategory) => (
                <button
                  key={subcategory.no}
                  onClick={() => setSelectedSubcategoryNo(String(subcategory.no))}
                  className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedSubcategoryNo === String(subcategory.no)
                      ? 'bg-[#00A651] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">모임 목록을 불러오는 중입니다.</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{loadError}</p>
          </div>
        ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => {
            const isLiked = meeting.liked;
            
            return (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
                onClick={() => onMeetingClick(meeting)}
              >
                {/* 데스크톱 버전 - 가로형 레이아웃 */}
                <div className="hidden sm:block">
                  <div className="flex">
                    {/* 썸네일 이미지 */}
                    <div className="relative w-64 h-40 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={meeting.image}
                        alt={meeting.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {/* 하트 아이콘 */}
                      <button 
                        onClick={(e) => handleLikeClick(e, meeting.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200"
                      >
                        <Star
                          className={`w-4 h-4 transition-all duration-300 ${
                            isLiked
                              ? 'fill-yellow-400 text-yellow-400 scale-110'
                              : 'text-gray-500'
                          }`}
                        />
                      </button>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 p-6 flex items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 hover:text-[#00A651] transition-colors mb-3">
                          {meeting.title}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                            <span>{meeting.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                            <span>{meeting.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* 인원수 - 세로 중앙 */}
                      <div className="flex items-center text-sm font-medium text-[#00A651] flex-shrink-0">
                        <Users className="w-4 h-4 mr-1" />
                        {meeting.participants}/{meeting.maxParticipants}명
                      </div>

                      {/* 삭제 버튼 - 카드 우측 */}
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteClick(e, meeting.id)}
                          className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-all duration-200 flex-shrink-0"
                        >
                          <Trash2
                            className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 모바일 버전 - 작은 가로형 레이아웃 */}
                <div className="sm:hidden flex gap-3 p-3">
                  {/* 왼쪽: 썸네일 */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={meeting.image}
                      alt={meeting.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={(e) => handleLikeClick(e, meeting.id)}
                      className="absolute top-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isLiked
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>

                    {/* 관리자 삭제 버튼 */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteClick(e, meeting.id)}
                        className="absolute bottom-1 right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* 오른쪽: 정보 */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* 제목 */}
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                      {meeting.title}
                    </h3>

                    {/* 장소 */}
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{meeting.location}</span>
                    </div>

                    {/* 일정 */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{meeting.date}</span>
                    </div>

                    {/* 리더 정보와 인원 수 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                          {meeting.host.charAt(0)}
                        </div>
                        <span className="ml-1.5 text-xs text-gray-700 font-medium truncate">
                          {meeting.host}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-[#00A651] font-medium ml-2 flex-shrink-0">
                        <Users className="w-3 h-3 mr-1" />
                        {meeting.participants}/{meeting.maxParticipants}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {!isLoading && !loadError && filteredMeetings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              아직 등록된 모임이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-6">모임을 즐겨찾기에 추가하시려면 로그인해주세요.</p>
            <button
              onClick={() => {
                setShowLoginModal(false);
                onLoginClick?.();
              }}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#FF4D4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#FF4D4F]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">모임 삭제 확인</h3>
            <p className="text-gray-600 mb-6">정말로 이 모임을 삭제하시겠습니까?</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-gray-300 text-gray-600 font-bold py-3 px-6 rounded-full hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="w-full bg-[#FF4D4F] text-white font-bold py-3 px-6 rounded-full hover:bg-[#FF3B30] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}