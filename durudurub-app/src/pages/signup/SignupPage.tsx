import api from '@/api/axios';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface SignupPageProps {
  onClose: () => void;
  onLoginClick: () => void;
}

export function SignupPage({ onClose, onLoginClick }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    age: '',
    gender: '',
    address: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userId)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }
    
    // 나이 검증 (15 미만 체크)
    const age = parseInt(formData.age);
    if (age < 15) {
      toast.error('15세 미만은 이용 불가합니다');
      return;
    }
    
    // 나이 검증 (130세 이상 체크)
    if (age >= 130) {
      toast.error('올바른 나이를 입력해주세요');
      return;
    }
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {

    const form = new FormData();

    form.append("userId", formData.userId);
    form.append("password", formData.password);
    form.append("username", formData.nickname);
    form.append("age", formData.age);
    form.append("gender", formData.gender);
    form.append("address", formData.address);
    if (profileImageFile) {
      form.append('profileImgFile', profileImageFile);
    }

    const res = await api.post("/api/users/join", form);

    const data = res.data;

    if (data === "SUCCESS") {

      setSuccessMessage("회원가입이 완료되었습니다! 2초 후 로그인 페이지로 이동합니다.");

      setTimeout(() => {
        onLoginClick();
      }, 2000);

    } else {

      setErrorMessage("회원가입 실패");

    }

  } catch (error) {

    console.error(error);
    setErrorMessage("서버 연결 실패");

  }finally {

  setIsLoading(false);
}
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    // 나이 입력 시 검증
    if (name === 'age') {
      const ageValue = parseInt(value);
      if (value && ageValue >= 130) {
        toast.error('올바른 나이를 입력해주세요');
        return;
      }
    }
    
    // 이메일 입력 필드 변경 시 체크 상태 초기화
    if (name === 'userId') {
      setEmailCheckStatus('idle');
    }
    
    // 닉네임 입력 필드 변경 시 체크 상태 초기화
    if (name === 'nickname') {
      setNicknameCheckStatus('idle');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // 비밀번호 확인 필드 변경 시 에러 메시지 초기화 및 검증
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        if (value && formData.password !== value) {
          setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
          setPasswordError('');
        }
      } else if (name === 'password') {
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setProfileImage(null);
    }
  };

  // 이메일 중복 체크 함수
  const handleEmailCheck = async () => {

    if (!formData.userId) {
      toast.error("이메일을 입력해주세요");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.userId)) {
      toast.error("올바른 이메일 형식이 아닙니다");
      return;
    }

    setEmailCheckStatus("checking");

    try {

      const res = await api.get("/api/users/check-userid", {
        params: { userId: formData.userId }
      });

      if (res.data.ok) {

        setEmailCheckStatus("available");
        toast.success(res.data.message || "사용 가능한 이메일입니다");

      } else {

        setEmailCheckStatus("taken");
        toast.error(res.data.message || "이미 사용 중인 이메일입니다");

      }

    } catch (error) {

      console.error(error);
      toast.error("중복 체크 실패");
      setEmailCheckStatus("idle");

    }

};

  const handleNicknameCheck = async () => {

  if (!formData.nickname) {
    toast.error("닉네임을 입력해주세요");
    return;
  }

  setNicknameCheckStatus("checking");

  try {

    const res = await api.get("/api/users/check-username", {
      params: { username: formData.nickname }
    });

    if (res.data.ok) {
      setNicknameCheckStatus("available");
      toast.success(res.data.message || "사용 가능한 닉네임입니다");
    } else {
      setNicknameCheckStatus("taken");
      toast.error(res.data.message || "이미 사용 중인 닉네임입니다");
    }

  } catch (error) {

    console.error(error);
    toast.error("중복 체크 실패");
    setNicknameCheckStatus("idle");

  }

};

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" richColors />
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
          <p className="text-gray-600">새로운 모임을 시작해보세요</p>
        </div>

        {!showEmailForm ? (
          /* 소셜 회원가입 옵션만 보이기 */
          <div className="space-y-4">
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
                  <path d="M12 3C6.486 3 2 6.262 2 10.293c0 2.548 1.678 4.787 4.211 6.098-.175.635-.634 2.348-.726 2.738-.108.468.172.462.361.335.147-.099 2.447-1.652 3.373-2.27.586.082 1.191.126 1.811.126 5.514 0 9.97-3.262 9.97-7.293C21.97 6.262 17.514 3 12 3z"/>
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
                  <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                </svg>
                네이버로 시작하기
              </button>
            </div>

            {/* 이메일로 회원가입 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 이메일로 회원가입 버튼 */}
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-white border-2 border-[#00A651] text-[#00A651] py-3.5 rounded-full font-medium hover:bg-[#00A651] hover:text-white transition-colors"
            >
              이메일로 회원가입
            </button>

            {/* 로그인 링크 */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-[#00A651] font-medium hover:text-[#008f46]"
                >
                  로그인하기
                </button>
              </p>
            </div>
          </div>
        ) : (
        /* 회원가입 폼 */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 에러/성공 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {successMessage}
            </div>
          )}

          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#00A651] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#008f46] transition-colors"
              >
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">프로필 사진 (선택)</p>
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
                placeholder="이메일을 입력하세요"
                required
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={emailCheckStatus === 'checking'}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  emailCheckStatus === 'available'
                    ? 'bg-green-50 text-green-600 border border-green-300'
                    : emailCheckStatus === 'taken'
                    ? 'bg-red-50 text-red-600 border border-red-300'
                    : 'bg-white text-[#00A651] border border-[#00A651] hover:bg-[#00A651] hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {emailCheckStatus === 'checking' ? '확인 중...' : emailCheckStatus === 'available' ? '사용가능' : emailCheckStatus === 'taken' ? '사용불가' : '중복확인'}
              </button>
            </div>
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
                placeholder="6자 이상 입력하세요"
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

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-2 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
                placeholder="닉네임을 입력하세요"
                required
              />
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={nicknameCheckStatus === 'checking'}
                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  nicknameCheckStatus === 'available'
                    ? 'bg-green-50 text-green-600 border border-green-300'
                    : nicknameCheckStatus === 'taken'
                    ? 'bg-red-50 text-red-600 border border-red-300'
                    : 'bg-white text-[#00A651] border border-[#00A651] hover:bg-[#00A651] hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {nicknameCheckStatus === 'checking' ? '확인 중...' : nicknameCheckStatus === 'available' ? '사용가능' : nicknameCheckStatus === 'taken' ? '사용불가' : '중복확인'}
              </button>
            </div>
          </div>

          {/* 나이 */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              나이
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
              placeholder="나이를 입력하세요"
              min="1"
              max="129"
              required
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별
            </label>
            <div className="flex gap-4">
              <label className="flex items-center flex-1 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-[#00A651] transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00A651] bg-white border-gray-300 focus:ring-[#00A651]"
                  required
                />
                <span className="ml-3 text-gray-700">남성</span>
              </label>
              <label className="flex items-center flex-1 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-[#00A651] transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00A651] bg-white border-gray-300 focus:ring-[#00A651]"
                  required
                />
                <span className="ml-3 text-gray-700">여성</span>
              </label>
            </div>
          </div>

          {/* 주소 */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent transition-all"
              placeholder="주소를 입력하세요"
              required
            />
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-[#00A651] bg-white border-gray-300 rounded focus:ring-[#00A651]"
                required
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">(필수)</span> 이용약관에 동의합니다
              </label>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreePrivacy"
                name="agreePrivacy"
                checked={formData.agreePrivacy}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-[#00A651] bg-white border-gray-300 rounded focus:ring-[#00A651]"
                required
              />
              <label htmlFor="agreePrivacy" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">(필수)</span> 개인정보 처리방침에 동의합니다
              </label>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00A651] text-white py-3.5 rounded-full font-medium hover:bg-[#008f46] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}