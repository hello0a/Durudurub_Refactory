import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { ExplorePageWrapper } from '@/pages/explore/ExplorePageWrapper';
import { LoginPageWrapper } from '@/pages/login/LoginPageWrapper';
import { SignupPageWrapper } from '@/pages/signup/SignupPageWrapper';
import { MyPageWrapper } from '@/pages/mypage/MyPageWrapper';
import { MyMeetingsWrapper } from '@/pages/mypage/MyMeetingsWrapper';
import ClubDetailWrapper from '@/pages/communityDetail/ClubDetailWrapper';
import { CreateCommunityPageWrapper } from '@/pages/communityCreate/CreateCommunityPageWrapper';
import { CategoryPageWrapper } from '@/pages/category/CategoryPageWrapper';
import { NoticePageWrapper } from '@/pages/notice/NoticePageWrapper';
import { NoticeWritePageWrapper } from '@/pages/notice/NoticeWritePageWrapper';
import {
  ForgotPasswordPageWrapper,
  MiniGamePageWrapper,
  FavoritesPageWrapper,
  AdminPageWrapper,
  PaymentPageWrapper,
  PaymentSuccessPageWrapper,
  PaymentFailPageWrapper,
} from '@/pages/other/OtherPagesWrapper';
import { Error403Page } from '@/pages/error/Error403Page';
import { Error404Page } from '@/pages/error/Error404Page';
import { Error500Page } from '@/pages/error/Error500Page';
import OAuthSuccess from './pages/login/OAuthSuccess';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explore',
        element: <ExplorePageWrapper />,
      },
      {
        path: 'mypage',
        element: <MyPageWrapper />,
      },
      {
        path: 'meetings',
        element: <MyMeetingsWrapper />,
      },
      {
        path: 'favorites',
        element: <FavoritesPageWrapper />,
      },
      {
        path: 'community/create',
        element: <CreateCommunityPageWrapper />,
      },
      {
        path: 'community/:id',
        element: <ClubDetailWrapper />,
      },
      {
        path: 'category/:category',
        element: <CategoryPageWrapper />,
      },
      {
        path: 'notice',
        element: <NoticePageWrapper />,
      },
      {
        path: 'notice/write',
        element: <NoticeWritePageWrapper />,
      },
      {
        path: 'minigame',
        element: <MiniGamePageWrapper />,
      },
      {
        path: 'admin',
        element: <AdminPageWrapper />,
      },
      {
        path: 'login',
        element: <LoginPageWrapper />,
      },
      {
        path: 'signup',
        element: <SignupPageWrapper />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPageWrapper />,
      },
      {
        path: 'payment',
        element: <PaymentPageWrapper />,
      },
      {
        path: 'payment/success',
        element: <PaymentSuccessPageWrapper />,
      },
      {
        path: 'payment/fail',
        element: <PaymentFailPageWrapper />,
      },
      // 에러 페이지들
      {
        path: 'error/403',
        element: <Error403Page />,
      },
      {
        path: 'error/404',
        element: <Error404Page />,
      },
      {
        path: 'error/500',
        element: <Error500Page />,
      },
      // 404 Not Found
      {
        path: '*',
        element: <Error404Page />,
      },
      // 소셜 로그인
      {
        path: '/oauth-success',
        element: <OAuthSuccess />
      }
    ],
  },
]);