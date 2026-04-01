import {
  TrendingUp,
  Dumbbell,
  Utensils,
  Gamepad2,
  Users,
  Plane,
  Palette,
  MoreHorizontal,
} from 'lucide-react';

interface CategorySectionProps {
  onCategoryClick: (category: string) => void;
  onMoreClick?: () => void;
}

const categories = [
  { id: 1, name: '자기계발', icon: TrendingUp, color: 'bg-[#E5F3FF]', iconColor: 'text-[#4A90E2]' },
  { id: 2, name: '스포츠', icon: Dumbbell, color: 'bg-[#F0E5FF]', iconColor: 'text-[#9B59B6]' },
  { id: 3, name: '푸드', icon: Utensils, color: 'bg-[#FFF5E5]', iconColor: 'text-[#FF8A3D]' },
  { id: 4, name: '게임', icon: Gamepad2, color: 'bg-[#FFF0E5]', iconColor: 'text-[#FF9800]' },
  { id: 5, name: '동네친구', icon: Users, color: 'bg-[#E5F9F0]', iconColor: 'text-[#00A651]' },
  { id: 6, name: '여행', icon: Plane, color: 'bg-[#E5F9FF]', iconColor: 'text-[#00BCD4]' },
  { id: 7, name: '예술', icon: Palette, color: 'bg-[#FFE5F5]', iconColor: 'text-[#E91E63]' },
];

export function CategorySection({ onCategoryClick, onMoreClick }: CategorySectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            어떤 모임을 찾으시나요?
          </h2>
          <p className="text-gray-600">
            관심있는 카테고리를 선택해보세요
          </p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="flex flex-col items-center group"
                onClick={() => onCategoryClick(category.name)}
              >
                {/* 아이콘 원형 버튼 */}
                <div
                  className={`w-20 h-20 ${category.color} rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                >
                  <Icon className={`w-9 h-9 ${category.iconColor}`} />
                </div>
                {/* 카테고리 이름 */}
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#00A651] transition-colors">
                  {category.name}
                </span>
              </button>
            );
          })}
          {onMoreClick && (
            <button
              className="flex flex-col items-center group"
              onClick={onMoreClick}
            >
              {/* 아이콘 원형 버튼 */}
              <div
                className={`w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <MoreHorizontal className={`w-9 h-9 text-gray-500`} />
              </div>
              {/* 카테고리 이름 */}
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#00A651] transition-colors">
                더보기
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}