import { useNavigate, useLocation } from 'react-router';
import { LoginPage } from '@/pages/login/LoginPage';
import { useApp } from '@/contexts/AppContext';

export function LoginPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogin } = useApp();

  // 로그인 후 돌아갈 위치 (이전 페이지 또는 홈)
  const from = (location.state as any)?.from?.pathname || '/';

  return (
    <LoginPage
      onClose={() => navigate(from)}
      onSignupClick={() => navigate('/signup')}
      onForgotPasswordClick={() => navigate('/forgot-password')}
      onLoginSuccess={(userData, token, profileImage) => {
        handleLogin(userData, token, profileImage);
        navigate(from);
      }}
    />
  );
}
