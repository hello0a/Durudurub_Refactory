import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import api from '@/api/axios';
import { useApp } from '@/contexts/AppContext';

interface PaymentSuccessPageProps {
  onGoHome: () => void;
  onGoMyPage: () => void;
}

interface PaymentFailPageProps {
  onRetry: () => void;
  onGoHome: () => void;
}

export function PaymentSuccessPage({ onGoHome, onGoMyPage }: PaymentSuccessPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('결제를 승인하는 중입니다.');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { setUser } = useApp();

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setMessage('결제 승인 정보가 올바르지 않습니다.');
      return;
    }

    let cancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const confirmPayment = async () => {
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await api.post('/confirm/payment', {
            paymentKey,
            orderId,
            amount,
          });

          if (cancelled) {
            return;
          }

          if (typeof response.data?.isPremium !== 'undefined') {
            setUser((prevUser) => {
              if (!prevUser) {
                return prevUser;
              }

              const nextUser = {
                ...prevUser,
                isPremium: Boolean(response.data.isPremium),
                premiumEndDate: response.data?.endDate || null,
              };

              sessionStorage.setItem('user', JSON.stringify(nextUser));
              return nextUser;
            });
          }

          const isAlreadyConfirmed = Boolean(response.data?.alreadyConfirmed);
          setErrorCode(null);
          setStatus('success');
          setMessage(
            isAlreadyConfirmed
            ? '결제가 완료되었습니다. 프리미엄 구독이 활성화되었습니다.'
            : '승인된 결제입니다. 프리미엄 구독 상태를 확인해주세요.'
          );
          return;
        } catch (error: any) {
          if (cancelled) {
            return;
          }

          const code = error?.response?.data?.code || null;
          const errorMessage = error?.response?.data?.message || '결제 승인 중 오류가 발생했습니다.';
          const shouldRetryProviderError =
            code === 'PROVIDER_ERROR' ||
            (code === 'TOSS_CONFIRM_FAILED' && typeof errorMessage === 'string' && errorMessage.includes('PROVIDER_ERROR'));

          // Toss PROVIDER_ERROR는 일시 장애일 수 있어 짧게 재시도한다.
          if (shouldRetryProviderError && attempt < maxAttempts) {
            setStatus('loading');
            setMessage(`결제 승인 재시도 중입니다. (${attempt}/${maxAttempts - 1})`);
            await sleep(1500 * attempt);
            continue;
          }

          setErrorCode(code);
          setStatus('error');
          setMessage(errorMessage);
          return;
        }
      }
    };

    void confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-200 p-8 text-center">
        {status === 'loading' && <Loader2 className="w-14 h-14 text-[#00A651] animate-spin mx-auto mb-4" />}
        {status === 'success' && <CheckCircle2 className="w-14 h-14 text-[#00A651] mx-auto mb-4" />}
        {status === 'error' && <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />}

        <h1 className="text-2xl font-bold text-gray-900 mb-3">결제 결과</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        {status === 'error' && errorCode && (
          <p className="text-xs text-gray-400 mb-8">오류 코드: {errorCode}</p>
        )}

        <div className="flex flex-col gap-3">
          {status === 'success' && (
            <button
              onClick={onGoMyPage}
              className="w-full py-3 rounded-xl bg-[#00A651] text-white font-semibold hover:bg-[#008f46] transition-colors"
            >
              마이페이지로 이동
            </button>
          )}
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaymentFailPage({ onRetry, onGoHome }: PaymentFailPageProps) {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-200 p-8 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-gray-900 mb-3">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-2">{message || '결제 처리 중 문제가 발생했습니다.'}</p>
        {code && <p className="text-sm text-gray-400 mb-8">오류 코드: {code}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl bg-[#00A651] text-white font-semibold hover:bg-[#008f46] transition-colors"
          >
            다시 결제하기
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}