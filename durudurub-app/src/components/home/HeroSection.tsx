interface HeroSectionProps {
  onExploreClick?: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section className="hidden md:block bg-[#F0F9F4] py-12 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* 텍스트 영역 - 모바일에서 숨김 */}
          <div className="hidden md:flex flex-1 text-center lg:text-left flex-col">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              함께 하면<br />
              더 즐거운 순간
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              관심사가 같은 사람들과 모여<br />
              새로운 경험을 만들어보세요
            </p>
            <button 
              onClick={onExploreClick}
              className="bg-[#00A651] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#008f46] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              모임 둘러보기
            </button>
          </div>

          {/* 모바일 전용 버튼 - 중앙 정렬 */}
          <div className="md:hidden w-full flex justify-center">
            <button 
              onClick={onExploreClick}
              className="bg-[#00A651] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#008f46] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              모임 둘러보기
            </button>
          </div>

          {/* 이미지 영역 - 모바일에서 숨김 */}
          <div className="hidden md:block flex-1 w-full lg:w-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMGdyb3VwJTIwZnJpZW5kcyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2OTU5MDQ2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="함께하는 즐거운 순간"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00A651]/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}