import { CommunityCard } from '@/components/communityCard/CommunityCard';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/api/axios';

interface CategoryListPageProps {
  category: string;
  onBack: () => void;
  user?: any;
  onLoginClick?: () => void;
}

interface ApiCategory {
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
  hostName?: string;
  hostUserId?: string;
}

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

export function CategoryListPage({ category, onBack, user, onLoginClick }: CategoryListPageProps) {
  const [clubs, setClubs] = useState<ApiClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchCategoryClubs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const categoryNo = await resolveCategoryNo();

        if (!categoryNo) {
          if (!isCancelled) {
            setClubs([]);
            setError('카테고리를 찾을 수 없습니다.');
          }
          return;
        }

        let data: ApiClub[] = [];

        try {
          const res = await api.get<ApiClub[]>(`/club/api/clubs/category/${categoryNo}`);
          data = res.data || [];
        } catch {
          const fallbackRes = await api.get<ApiClub[]>(`/api/clubs/category/${categoryNo}`);
          data = fallbackRes.data || [];
        }

        if (!isCancelled) {
          setClubs(data);
        }
      } catch (err) {
        console.error('카테고리 모임 조회 실패:', err);
        if (!isCancelled) {
          setError('모임 목록을 불러오지 못했습니다.');
          setClubs([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchCategoryClubs();

    return () => {
      isCancelled = true;
    };
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-[#00A651] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{category} 모임</h1>
          <p className="text-gray-600 mt-2">총 {clubs.length}개의 모임</p>
        </div>
      </div>

      {/* 모임 리스트 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <p className="text-gray-500">모임 목록을 불러오는 중입니다...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : clubs.length === 0 ? (
          <p className="text-gray-500">등록된 모임이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <CommunityCard
                key={club.no}
                image={normalizeImageUrl(club.thumbnailImg)}
                title={club.title || '제목 없음'}
                description={club.description || '모임 소개가 없습니다.'}
                location={club.location || '장소 정보 없음'}
                hostName={club.hostName || club.hostUserId || '모임장'}
                participants={{
                  current: club.currentMembers || 0,
                  max: club.maxMembers || 0,
                }}
                user={user}
                onLoginClick={onLoginClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}