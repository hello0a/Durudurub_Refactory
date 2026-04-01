import { ArrowLeft, Trophy, RotateCcw, Gamepad2, Grid3x3, Grid, Disc, Users, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LadderGame } from '@/components/games/LadderGame';
import { WheelSpinnerGame } from '@/components/games/WheelSpinnerGame';
import { WinnerDrawGame } from '@/components/games/WinnerDrawGame';
import { GameAdModal } from '@/components/modal/GameAdModal';
import { BannerData } from '@/pages/admin/AdminPage';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface MiniGamePageProps {
  onBack: () => void;
  user?: any;
  accessToken?: string | null;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onNoticeClick?: () => void;
  onMyPageClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  profileImage?: string | null;
  onLogout?: () => void;
}

type GameType = 'menu' | 'ladder' | 'wheel' | 'lottery';

export function MiniGamePage({ onBack, user, accessToken, onSignupClick, onLoginClick, onLogoClick, onNoticeClick, onMyPageClick, onMiniGameClick, onMyMeetingsClick, profileImage, onLogout }: MiniGamePageProps) {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [showAdModal, setShowAdModal] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [adTimer, setAdTimer] = useState(3);

  const gameCards = [
    {
      id: 'ladder',
      title: '사다리 게임',
      description: '사다리를 타고 내려가 결과를 확인하세요',
      icon: Grid,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'wheel',
      title: '원판 돌리기',
      description: '행운의 룰렛을 돌려 당첨을 확인하세요',
      icon: Disc,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'lottery',
      title: '당첨자 추첨',
      description: '참가자 중 당첨자를 무작위로 추첨합니다',
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
  ];


    // 광고 모달
    const [popupBanner, setPopupBanner] = useState<BannerData | null>(null);
    const [banners, setBanners] = useState<BannerData[]>([]);
    useEffect(() => {
      const loadBanners = async () => {
        try {
          const res = await fetch('/api/banners');
          const data = await res.json();
          setBanners(
            data.map((b: any) => ({
              ...b,
              isActive: b.isActive === 'Y'
            }))
          );
        } catch (error) {
          console.error('배너 불러오기 실패', error);
        }
      };
      
      loadBanners();
    }, []);
  
    useEffect(() => {
      if (!banners.length) return;
      const isAdmin = user?.isAdmin || user?.userId === 'admin';
      const isPremium = user?.isPremium || false;

      // 🚨 여기 추가
      if (isAdmin || isPremium) return;
      
      const popupBanners = banners.filter(
        b => b.position === 'POPUP' && b.isActive
      );
  
      if (popupBanners.length === 0) return;
  
      const randomIndex = Math.floor(Math.random() * popupBanners.length);
      setPopupBanner(popupBanners[randomIndex]);
      setShowAdModal(true);
    }, [banners]);
    useEffect(() => {
    if (showAdModal) {
      const timer = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showAdModal]);
  

  // 게임 진입 시 광고 표시 (프리미엄 및 관리자 제외)
  useEffect(() => {
    // 게임 메뉴 화면이 아니고, 아직 광고를 보여주지 않았을 때
    if (currentGame !== 'menu' && !adShown) {
      // 관리자이거나 프리미엄 구독자는 광고를 보지 않음
      const isAdmin = user?.isAdmin || user?.userId === 'admin';
      const isPremium = user?.isPremium || false;
      
      if (!isAdmin && !isPremium) {
        setShowAdModal(true);
        setAdShown(true);
      }
    }
    
    // 게임 메뉴로 돌아가면 광고 표시 상태 리셋
    if (currentGame === 'menu') {
      setAdShown(false);
    }
  }, [currentGame, adShown, user]);

  if (currentGame === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A651]/10 to-[#00A651]/5 pb-20 md:pb-0">
        {/* 메인 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 타이틀 */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">재미있는 미니 게임</h2>
            <p className="text-lg text-gray-600">원하는 게임을 선택해서 즐겨보세요!</p>
          </div>

          {/* 게임 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {gameCards.map((game) => (
              <button
                key={game.id}
                onClick={() => setCurrentGame(game.id as GameType)}
                className="bg-white rounded-2xl transition-all p-8 text-left group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <game.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#00A651] transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-600">{game.description}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // 각 게임 화면은 다음 단계에서 구현
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00A651]/10 to-[#00A651]/5 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8">
          <div className="flex justify-start mb-6">
            <button
              onClick={() => setCurrentGame('menu')}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 hover:bg-[#00A651] hover:text-white transition-all rounded-full shadow-sm hover:shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {currentGame === 'ladder' && <LadderGame />}
          {currentGame === 'wheel' && <WheelSpinnerGame />}
          {currentGame === 'lottery' && <WinnerDrawGame />}
        </div>
      </div>

      {/* 광고 모달 */}
      {/* {showAdModal && <GameAdModal onClose={() => setShowAdModal(false)} />} */}
        {showAdModal && popupBanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
            {/* X 버튼 - 15초 후 활성화 */}
            <button
              onClick={() => adTimer <= 0 && setShowAdModal(false)}
              disabled={adTimer > 0}
              className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                adTimer > 0 
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              aria-label="닫기"
            >
              {adTimer > 0 ? (
                <span className="text-sm font-bold">{adTimer}</span>
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>

            {/* 광고 이미지 */}
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-cyan-500">
              <ImageWithFallback
                src={popupBanner?.imageUrl}
                alt={popupBanner?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                    SPONSORED AD
                  </div>
                  <h3 className="text-white text-2xl font-bold">{popupBanner?.title}</h3>
                </div>
              </div>
            </div>

            {/* 광고 내용 */}
            <div className="p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-3">몰입감 넘치는 사운드 경험</h4>
              <p className="text-gray-600 mb-6">
                {popupBanner?.description}
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-gray-400 line-through text-lg">₩299,000</span>
                <span className="text-3xl font-bold text-blue-600">₩199,000</span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">33% OFF</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                onClick={() => {
                  setShowAdModal(false);

                  if (popupBanner?.linkUrl) {
                    window.location.href = popupBanner.linkUrl;
                  }
                }}
              >
                자세히 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}