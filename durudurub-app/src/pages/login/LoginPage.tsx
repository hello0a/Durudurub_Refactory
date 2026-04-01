import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import api from '@/api/axios';

interface LoginPageProps {
  onClose: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: (user: any, accessToken: string, profileImage?: string | null) => void;
}

export function LoginPage({ onClose, onSignupClick, onForgotPasswordClick, onLoginSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingTestAccount, setIsCreatingTestAccount] = useState(false);
  const [testAccountMessage, setTestAccountMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false); // 이메일 폼 표시 여부

  // 컴포넌트 마운트 시 저장된 아이디 불러오기
  useEffect(() => {
    const savedUserId = localStorage.getItem('savedUserId');
    if (savedUserId) {
      setFormData(prev => ({
        ...prev,
        userId: savedUserId,
        rememberMe: true,
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post("/api/users/login", {
        userId: formData.userId,
        password: formData.password,
      });

      const data = res.data;
      console.log('[LoginPage] 서버 응답:', data);

      if (data.success) {
        const resolvedProfileImage = data.profileImg
          ? (data.profileImg.startsWith('http://') || data.profileImg.startsWith('https://')
              ? data.profileImg
              : `http://localhost:8080${data.profileImg.startsWith('/') ? data.profileImg : `/${data.profileImg}`}`)
          : null;

        const loginUser = {
          id: data.userId,
          userId: data.userId,
          email: data.userId,
          name: data.username || data.userId,
          username: data.username || data.userId,
          isAdmin: data.role === 'ROLE_ADMIN',
        };

        sessionStorage.setItem("accessToken", data.token);
        sessionStorage.setItem("user", JSON.stringify(loginUser));
        if (resolvedProfileImage) {
          sessionStorage.setItem('profileImage', resolvedProfileImage);
        } else {
          sessionStorage.removeItem('profileImage');
        }

        if (formData.rememberMe) {
          localStorage.setItem("savedUserId", formData.userId);
        } else {
          localStorage.removeItem("savedUserId");
        }

        console.log('[LoginPage] loginUser:', loginUser);
        console.log('[LoginPage] onLoginSuccess 존재여부:', !!onLoginSuccess);
        if (onLoginSuccess) {
          onLoginSuccess(loginUser, data.token, resolvedProfileImage);
        } else {
          onClose();
        }
      } else {
        setErrorMessage(data.error || '로그인에 실패했습니다.');
      }

    } catch (error) {
      console.error('로그인 오류:', error);
      setErrorMessage('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00A651] mb-2">두루두룹</h1>
          <p className="text-gray-600">다시 만나서 반가워요!</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* test 계정 성공 메시지 */}
          {testAccountMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {testAccountMessage}
            </div>
          )}

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          {/* 모바일: 소셜 로그인 먼저 표시 (데스크톱에서는 숨김) */}
          {!showEmailForm && (
            <div className="md:hidden space-y-3">
              {/* 소셜 로그인 버튼들 */}
              {/* 카카오 로그인 */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
                }}
                className="w-full bg-[#FEE500] text-[#000000] py-3.5 rounded-full font-medium hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.486 3 2 6.262 2 10.293c0 2.548 1.678 4.787 4.211 6.098-.175.635-.634 2.348-.726 2.738-.108.468.172.462.361.335.147-.099 2.447-1.652 3.373-2.27.586.082 1.191.126 1.811.126 5.514 0 9.97-3.262 9.97-7.293C21.97 6.262 17.514 3 12 3z" />
                </svg>
                카카오로 시작하기
              </button>

              {/* 구글 로그인 */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "http://localhost:8080/oauth2/authorization/google";
                }}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3.5 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                구글로 시작하기
              </button>

              {/* 네이버 로그인 */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "http://localhost:8080/oauth2/authorization/naver";
                }}
                className="w-full bg-[#03C75A] text-white py-3.5 rounded-full font-medium hover:bg-[#02b351] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                네이버로 시작하기
              </button>

              {/* 이메일로 로그인 버튼 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                이메일로 로그인
              </button>
            </div>
          )}

          {/* 데스크톱 또는 이메일 폼 선택 시: 이메일/비밀번호 폼 표시 */}
          <div className={showEmailForm ? 'block' : 'hidden md:block'}>
            {/* 모바일에서 뒤로가기 버튼 */}
            {showEmailForm && (
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="md:hidden mb-4 text-sm text-gray-600 hover:text-[#00A651] flex items-center gap-1"
              >
                ← 다른 방법으로 로그인
              </button>
            )}

            {/* 이메일 */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 로그인 유지 & 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00A651] bg-white border-gray-300 rounded focus:ring-[#00A651]"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  이메일 저장
                </label>
              </div>
              {onForgotPasswordClick && (
                <button
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-sm text-gray-600 hover:text-[#00A651] transition-colors"
                >
                  비밀번호 찾기
                </button>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00A651] text-white py-3.5 rounded-full font-medium hover:bg-[#008f46] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            {/* 데스크톱: 소셜 로그인 구분선 및 버튼 */}
            <div className="hidden md:block">
              {/* 소셜 로그인 구분선 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* 소셜 로그인 버튼들 */}
              <div className="space-y-3">
                {/* 카카오 로그인 */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
                  }}
                  className="w-full bg-[#FEE500] text-[#000000] py-3.5 rounded-full font-medium hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.486 3 2 6.262 2 10.293c0 2.548 1.678 4.787 4.211 6.098-.175.635-.634 2.348-.726 2.738-.108.468.172.462.361.335.147-.099 2.447-1.652 3.373-2.27.586.082 1.191.126 1.811.126 5.514 0 9.97-3.262 9.97-7.293C21.97 6.262 17.514 3 12 3z" />
                  </svg>
                  카카오로 시작하기
                </button>

                {/* 구글 로그인 */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "http://localhost:8080/oauth2/authorization/google";
                  }}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3.5 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  구글로 시작하기
                </button>

                {/* 네이버 로그인 */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "http://localhost:8080/oauth2/authorization/naver";
                  }}
                  className="w-full bg-[#03C75A] text-white py-3.5 rounded-full font-medium hover:bg-[#02b351] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                  </svg>
                  네이버로 시작하기
                </button>
              </div>
            </div>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              아직 회원이 아니신가요?{' '}
              <button
                type="button"
                onClick={onSignupClick}
                className="text-[#00A651] font-medium hover:text-[#008f46]"
              >
                회원가입하기
              </button>
            </p>
          </div>


        </form>
      </div>
    </div>
  );
}