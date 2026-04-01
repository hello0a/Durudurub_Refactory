import { useNavigate } from 'react-router';
import { SignupPage } from '@/pages/signup/SignupPage';

export function SignupPageWrapper() {
  const navigate = useNavigate();

  return (
    <SignupPage
      onClose={() => navigate(-1)}
      onLoginClick={() => navigate('/login')}
    />
  );
}
