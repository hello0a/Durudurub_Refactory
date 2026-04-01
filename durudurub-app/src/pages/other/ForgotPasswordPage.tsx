import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface ForgotPasswordPageProps {
  onClose: () => void;
  onSignupClick: () => void;
  onLoginClick: () => void;
}

export function ForgotPasswordPage({ onClose, onSignupClick, onLoginClick }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기서는 단순히 제출됨 상태로 변경
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 relative">
        {/* X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 뒤로가기 버튼 */}
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-[#00A651] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          메인화면으로 돌아가기
        </button>

        {!isSubmitted ? (
          <>
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#00A651] mb-2">비밀번호 찾기</h1>
              <p className="text-gray-600">
                가입하신 이메일 주소를 입력해주세요.<br />
                비밀번호 재설정 안내를 보내드립니다.
              </p>
            </div>

            {/* 이메일 입력 폼 */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                className="w-full bg-[#00A651] text-white py-3.5 rounded-full font-medium hover:bg-[#008f46] transition-colors mt-6"
              >
                비밀번호 재설정 링크 받기
              </button>
            </form>

            {/* 안내 문구 */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">안내사항</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start">
                  <span className="text-[#00A651] mr-2">•</span>
                  <span>이메일이 도착하지 않으면 스팸 메일함을 확인해주세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00A651] mr-2">•</span>
                  <span>링크는 24시간 동안 유효합니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#00A651] mr-2">•</span>
                  <span>문제가 지속되면 관리자에게 문의해주세요.</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* 제출 완료 화면 */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#00A651] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                이메일을 확인해주세요
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-[#00A651]">{email}</span>로<br />
                비밀번호 재설정 링크를 전송했습니다.
              </p>

              <div className="bg-[#00A651]/10 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-[#00A651] mb-3">다음 단계</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#00A651] mr-2">1.</span>
                    <span>이메일 수신함을 확인하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00A651] mr-2">2.</span>
                    <span>비밀번호 재설정 링크를 클릭하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00A651] mr-2">3.</span>
                    <span>새로운 비밀번호를 설정하세요</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-[#00A651] text-white rounded-full hover:bg-[#008f46] transition-colors font-medium"
              >
                메인화면으로 돌아가기
              </button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full mt-3 text-sm text-gray-600 hover:text-gray-700"
              >
                다른 이메일로 재전송
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}