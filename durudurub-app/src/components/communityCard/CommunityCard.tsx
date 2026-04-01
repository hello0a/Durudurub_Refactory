import { Heart, X, Lock } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface CommunityCardProps {
  image: string;
  tag?: string;
  title: string;
  description: string;
  location: string;
  hostName: string;
  participants?: {
    current: number;
    max: number;
  };
  isLiked?: boolean;
  onLikeToggle?: () => void;
  onClick?: () => void;
  user?: any;
  onLoginClick?: () => void;
}

export function CommunityCard({
  image,
  tag,
  title,
  description,
  location,
  hostName,
  participants,
  isLiked: initialIsLiked = false,
  onLikeToggle,
  onClick,
  user,
  onLoginClick,
}: CommunityCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 비로그인 사용자는 로그인 모달 표시
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsLiked(!isLiked);
    onLikeToggle?.();
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* 데스크톱 버전 - 세로형 레이아웃 */}
      <div className="hidden md:block">
        {/* 이미지 영역 */}
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-5">
          {/* 제목 */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {title}
          </h3>

          {/* 설명 */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>

          {/* 하단 정보 영역 */}
          <div className="flex items-end justify-between">
            <div className="flex-1">
              {/* 장소 */}
              <p className="text-sm text-gray-500 mb-1">{location}</p>
              {/* 호스트 */}
              <p className="text-sm text-gray-600 mb-1">
                호스트: <span className="font-medium text-[#00A651]">{hostName}</span>
              </p>
              {/* 참가 인원 */}
              {participants && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-[#00A651]">{participants.current}</span>
                  <span className="text-gray-500">/{participants.max}명</span>
                </p>
              )}
            </div>

            {/* 하트 아이콘 */}
            <button
              onClick={handleLikeClick}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label={isLiked ? '좋아요 취소' : '좋아요'}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'fill-[#00A651] text-[#00A651]'
                    : 'text-gray-400 hover:text-[#00A651]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 버전 - 가로형 레이아웃 */}
      <div className="md:hidden flex gap-3 p-3">
        {/* 왼쪽: 썸네일 */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* 즐겨찾기 버튼 */}
          <button
            onClick={handleLikeClick}
            className="absolute top-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* 제목 */}
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
            {title}
          </h3>

          {/* 설명 */}
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">
            {description}
          </p>

          {/* 장소 */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span className="line-clamp-1">📍 {location}</span>
          </div>

          {/* 리더 정보와 인원 수 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                {hostName.charAt(0)}
              </div>
              <span className="ml-1.5 text-xs text-gray-700 font-medium truncate">
                {hostName}
              </span>
            </div>
            {participants && (
              <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
                👥 {participants.current}/{participants.max}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLoginModal(false);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
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
    </div>
  );
}