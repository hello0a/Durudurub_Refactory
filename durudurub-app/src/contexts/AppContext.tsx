import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  premiumEndDate?: string | null;
  subscription?: string;
}

interface AppContextType {
  user: User | null;
  accessToken: string | null;
  profileImage: string | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  setAccessToken: (token: string | null) => void;
  setProfileImage: (image: string | null) => void;
  handleLogin: (userData: User, token: string, profileImage?: string | null) => void;
  handleLogout: () => void;
  handleProfileImageUpdate: (newImage: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // 컴포넌트 마운트 시 sessionStorage에서 로그인 정보 확인
  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUser = sessionStorage.getItem('user');
    const storedProfileImage = sessionStorage.getItem('profileImage');

    if (storedToken && storedUser) {
      const tokenParts = storedToken.split('.'); 
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('profileImage');
            return;
          }
        } catch {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('profileImage');
          return;
        }

        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }
      } else {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profileImage');
      }
    }
  }, []);

  const resolveProfileImageUrl = (image: string | null | undefined) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }
    if (image.startsWith('/')) {
      return `http://localhost:8080${image}`;
    }
    return `http://localhost:8080/${image}`;
  };

  const handleLogin = (userData: User, token: string, newProfileImage?: string | null) => {
    setUser(userData);
    setAccessToken(token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('accessToken', token);

    const resolvedImage = resolveProfileImageUrl(newProfileImage);
    if (resolvedImage) {
      setProfileImage(resolvedImage);
      sessionStorage.setItem('profileImage', resolvedImage);
    } else {
      setProfileImage(null);
      sessionStorage.removeItem('profileImage');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('profileImage');
    setUser(null);
    setAccessToken(null);
    setProfileImage(null);
  };

  const handleProfileImageUpdate = (newImage: string | null) => {
    setProfileImage(newImage);
    if (newImage) {
      sessionStorage.setItem('profileImage', newImage);
    } else {
      sessionStorage.removeItem('profileImage');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        accessToken,
        profileImage,
        setUser,
        setAccessToken,
        setProfileImage,
        handleLogin,
        handleLogout,
        handleProfileImageUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
