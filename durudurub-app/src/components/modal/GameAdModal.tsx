import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface GameAdModalProps {
  onClose: () => void;
}

const adContent = {
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  brand: 'SPONSORED AD',
  title: 'Premium Wireless Headphones',
  subtitle: '몰입감 넘치는 사운드 경험',
  description: '최신 노이즈 캔슬링 기술과 프리미엄 음질로 당신만의 음악 세계를 즐겨보세요. 30시간 재생 가능한 배터리로 하루 종일 자유롭게!',
  originalPrice: '₩299,000',
  salePrice: '₩199,000',
  discount: '33% OFF',
  buttonText: '자세히 보기',
};

export function GameAdModal({ onClose }: GameAdModalProps) {
  const [timer, setTimer] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const canClose = timer <= 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* X 버튼 - 15초 후 활성화 */}
        <button
          onClick={() => canClose && onClose()}
          disabled={!canClose}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            canClose
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="닫기"
        >
          {canClose ? (
            <X className="w-5 h-5" />
          ) : (
            <span className="text-sm font-bold">{timer}</span>
          )}
        </button>

        {/* 광고 이미지 */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-cyan-500">
          <img
            src={adContent.imageUrl}
            alt={adContent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                {adContent.brand}
              </div>
              <h3 className="text-white text-2xl font-bold">{adContent.title}</h3>
            </div>
          </div>
        </div>

        {/* 광고 내용 */}
        <div className="p-8">
          <h4 className="text-xl font-bold text-gray-900 mb-3">{adContent.subtitle}</h4>
          <p className="text-gray-600 mb-6">
            {adContent.description}
          </p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-gray-400 line-through text-lg">{adContent.originalPrice}</span>
            <span className="text-3xl font-bold text-blue-600">{adContent.salePrice}</span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{adContent.discount}</span>
          </div>
          <button
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            onClick={onClose}
          >
            {adContent.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}