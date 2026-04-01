import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import api from '@/api/axios';

interface PaymentPageProps {
  onClose?: () => void;
  onPaymentSuccess?: () => void;
  onBack?: () => void;
  user?: any;
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
}

export function PaymentPage({ 
  onClose, 
  onPaymentSuccess,
  onBack,
  user,
  accessToken,
}: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '3months' | '6months'>('1month');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 구독 플랜 정보
  const plans = {
    '1month': { duration: '1개월', period: 1, price: 4900, discount: 0 },
    '3months': { duration: '3개월', period: 3, price: 13200, discount: 10, originalPrice: 14700 },
    '6months': { duration: '6개월', period: 6, price: 23520, discount: 20, originalPrice: 29400 },
  };

  const selectedPlanInfo = plans[selectedPlan];

  const handlePayment = async () => {
    if (!user || !accessToken) {
      toast.error('결제를 진행하려면 먼저 로그인해주세요.');
      return;
    }

    // 약관 동의 확인
    if (!agreeTerms || !agreePrivacy) {
      toast.error('약관 동의를 확인해주세요.');
      return;
    }

    setIsProcessing(true);

    // 결제 처리 시뮬레이션 (실제로는 결제 API 호출)
    try {
      const orderResponse = await api.post('/payments/order', {
        period: selectedPlanInfo.period,
      });

      const { orderId, amount, orderName, clientKey } = orderResponse.data;

      if (!clientKey) {
        throw new Error('Toss client key is missing.');
      }

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({
        customerKey: `durudurub_${user.userId || user.id || 'member'}`,
      });

      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName,
        // 여기 수정해야함!!!
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user.email,
        customerName: user.name || user.userId || '두루두룹 회원',
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });

    } catch (error) {
      console.error('결제 실패:', error);

      const message = error instanceof Error
        ? error.message
        : '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.';

      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">프리미엄 구독</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 상단 프리미엄 정보 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">두루두룹 프리미엄</h2>
              <p className="text-xl font-semibold text-[#00A651]">월 4,900원</p>
            </div>
          </div>

          {/* 혜택 목록 */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#00A651] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">제한 없는 AI 검색 기능</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#00A651] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">광고 없는 깨끗한 환경</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">언제든지 취소할 수 있습니다.</p>
        </div>

        {/* 구독 기간 선택 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">구독 기간 선택</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {/* 1개월 플랜 */}
            <button
              onClick={() => setSelectedPlan('1month')}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedPlan === '1month'
                  ? 'border-[#00A651] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">1개월</div>
                  <div className="text-sm text-gray-600 mt-1">₩4,900 / 월</div>
                </div>
                {selectedPlan === '1month' && (
                  <div className="w-6 h-6 bg-[#00A651] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* 3개월 플랜 */}
            <button
              onClick={() => setSelectedPlan('3months')}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedPlan === '3months'
                  ? 'border-[#00A651] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">3개월</span>
                    <span className="text-xs font-semibold text-white bg-[#00A651] px-2 py-0.5 rounded-full">
                      10% 할인
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">₩14,700</span>
                    <span className="text-sm font-semibold text-[#00A651]">₩13,200</span>
                    <span className="text-xs text-gray-500">(월 ₩4,400)</span>
                  </div>
                </div>
                {selectedPlan === '3months' && (
                  <div className="w-6 h-6 bg-[#00A651] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* 6개월 플랜 */}
            <button
              onClick={() => setSelectedPlan('6months')}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedPlan === '6months'
                  ? 'border-[#00A651] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">6개월</span>
                    <span className="text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700 px-2 py-0.5 rounded-full">
                      20% 할인
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">₩29,400</span>
                    <span className="text-sm font-semibold text-[#00A651]">₩23,520</span>
                    <span className="text-xs text-gray-500">(월 ₩3,920)</span>
                  </div>
                </div>
                {selectedPlan === '6months' && (
                  <div className="w-6 h-6 bg-[#00A651] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">약관 동의</h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#00A651] border-gray-300 rounded focus:ring-[#00A651]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#00A651] transition-colors">
                  서비스 약관 동의 (필수)
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#00A651] border-gray-300 rounded focus:ring-[#00A651]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#00A651] transition-colors">
                  개인정보 3자 제공 동의 (필수)
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all text-lg ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#00A651] hover:bg-[#008f46] shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              처리 중...
            </span>
          ) : (
            `₩${selectedPlanInfo.price.toLocaleString()} 결제하기`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          {selectedPlan === '1month' ? '결제 시 매월 자동 갱신됩니다.' : `${selectedPlanInfo.duration} 구독 후 자동 갱신됩니다.`}
        </p>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}