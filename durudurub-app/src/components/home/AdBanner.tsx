import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BannerData } from '@/pages/admin/AdminPage';


export function AdBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 광고 모달
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [mainBanners, setMainBanners] = useState<BannerData[]>([]);


  useEffect(() => {
  const loadBanners = async () => {
    try {
      const res = await fetch('/api/banners'); 

      const data = await res.json();

      const parsed: BannerData[] = data.map((b: any) => ({
        ...b,
        isActive: b.isActive === 'Y'
      }));

      setBanners(parsed);

      const main = parsed.filter(
        (b) => b.position === 'MAIN' && b.isActive
      );

      setMainBanners(main);

    } catch (error) {
      console.error('배너 불러오기 실패', error);
    }
  };

  loadBanners();
}, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [mainBanners]);

  useEffect(() => {
    if (mainBanners.length === 0) return;

    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mainBanners.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, mainBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      (prev - 1 + mainBanners.length) % mainBanners.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      (prev + 1) % mainBanners.length
    );
  };

  const currentBanner = mainBanners[currentIndex];
  if (!mainBanners.length) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full">
        {/* "광고" 라벨 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">Sponsored</span>
        </div>

        <div
          className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 group cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 광고 배너 이미지 */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {mainBanners.map((banner) => (
                <div key={banner.no} className="w-full flex-shrink-0 relative">
                  <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <ImageWithFallback
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-64 sm:h-72 lg:h-80 object-cover"
                    />

                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* 텍스트 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {banner.title}
                      </h3>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 이전/다음 버튼 */}
          {mainBanners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="이전 배너"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="다음 배너"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          {/* 인디케이터 */}
          {mainBanners.length > 1 && (
            <div className="absolute bottom-4 right-6 flex gap-2">
              {mainBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    width: index === currentIndex ? '24px' : '8px',
                  }}
                  aria-label={`${index + 1}번 배너로 이동`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}