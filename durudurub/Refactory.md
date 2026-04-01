### 백엔드 트리구조
youngaahn@Youngui-MacBookPro-2 durudurub % tree -L 9 -I "node_modules|.git|build|dist|uploads|*.png|*.jpg"
.
├── backup.patch
├── build.gradle
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
├── pigma.md
├── README.md
├── settings.gradle
├── SQL
│   ├── ai_search_logs.sql
│   ├── banners.sql
│   ├── categories.sql
│   ├── club_board_images.sql
│   ├── club_board_likes.sql
│   ├── club_boards.sql
│   ├── club_comment_likes.sql
│   ├── club_comments.sql
│   ├── club_likes.sql
│   ├── club_locations.sql
│   ├── club_member_reports.sql
│   ├── club_members.sql
│   ├── clubs.sql
│   ├── DDL.sql
│   ├── DML.sql
│   ├── notices.sql
│   ├── payments.sql
│   ├── persistence_logins.sql
│   ├── random_games.sql
│   ├── report_categories.sql
│   ├── sub_categories.sql
│   ├── subscriptions.sql
│   ├── user_auth.sql
│   ├── user_bans.sql
│   └── users.sql
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── aloha
    │   │           └── durudurub
    │   │               ├── config
    │   │               │   ├── GlobalExceptionHandler.java
    │   │               │   ├── MyBatisConfig.java
    │   │               │   ├── PasswordConfig.java
    │   │               │   ├── SecurityConfig.java
    │   │               │   └── WebConfig.java
    │   │               ├── controller
    │   │               │   ├── AdminApiController.java
    │   │               │   ├── AiFeatureController.java
    │   │               │   ├── AiSearchController.java
    │   │               │   ├── BannerController.java
    │   │               │   ├── BoardController.java
    │   │               │   ├── ClubApiController.java
    │   │               │   ├── ClubController.java
    │   │               │   ├── CommentController.java
    │   │               │   ├── GameController.java
    │   │               │   ├── HomeController.java
    │   │               │   ├── LikeController.java
    │   │               │   ├── MypageApiController.java
    │   │               │   ├── NoticeApiController.java
    │   │               │   ├── PaymentController.java
    │   │               │   ├── ReportController.java
    │   │               │   ├── UserApiController.java
    │   │               │   └── UserController.java
    │   │               ├── dao
    │   │               │   ├── AiSearchLogMapper.java
    │   │               │   ├── AuthMapper.java
    │   │               │   ├── BannerMapper.java
    │   │               │   ├── BoardMapper.java
    │   │               │   ├── CategoryMapper.java
    │   │               │   ├── ClubMapper.java
    │   │               │   ├── CommentMapper.java
    │   │               │   ├── GameMapper.java
    │   │               │   ├── LikeMapper.java
    │   │               │   ├── MemberMapper.java
    │   │               │   ├── NoticeMapper.java
    │   │               │   ├── PaymentMapper.java
    │   │               │   ├── ReportMapper.java
    │   │               │   ├── SubscriptionMapper.java
    │   │               │   └── UserMapper.java
    │   │               ├── dto
    │   │               │   ├── AdminSubscription.java
    │   │               │   ├── AiSearchLog.java
    │   │               │   ├── AiSearchResponse.java
    │   │               │   ├── Auth.java
    │   │               │   ├── Banner.java
    │   │               │   ├── Board.java
    │   │               │   ├── BoardImage.java
    │   │               │   ├── BoardLike.java
    │   │               │   ├── Category.java
    │   │               │   ├── Club.java
    │   │               │   ├── ClubLike.java
    │   │               │   ├── ClubMember.java
    │   │               │   ├── Comment.java
    │   │               │   ├── CommentLike.java
    │   │               │   ├── Game.java
    │   │               │   ├── HostClubresponse.java
    │   │               │   ├── Notice.java
    │   │               │   ├── Payment.java
    │   │               │   ├── PersistentLogin.java
    │   │               │   ├── Report.java
    │   │               │   ├── SubCategory.java
    │   │               │   ├── Subscription.java
    │   │               │   ├── Subscriptions.java
    │   │               │   ├── User.java
    │   │               │   └── UserBan.java
    │   │               ├── DurudurubApplication.java
    │   │               ├── security
    │   │               │   ├── CustomUserDetails.java
    │   │               │   ├── CustomUserDetailsService.java
    │   │               │   ├── JwtAuthenticationFilter.java
    │   │               │   ├── JwtProvider.java
    │   │               │   └── oauth
    │   │               │       ├── CustomOAuth2UserService.java
    │   │               │       ├── GoogleUserInfo.java
    │   │               │       ├── KakaoUserInfo.java
    │   │               │       ├── NaverUserInfo.java
    │   │               │       ├── OAuth2UserInfo.java
    │   │               │       ├── OAuth2UserInfoFactory.java
    │   │               │       └── OAuthSuccessHandler.java
    │   │               ├── service
    │   │               │   ├── 테스트
    │   │               │   ├── AiCategoryService.java
    │   │               │   ├── AiCategoryServiceImpl.java
    │   │               │   ├── AiChatbotService.java
    │   │               │   ├── AiChatbotServiceImpl.java
    │   │               │   ├── AiModerationService.java
    │   │               │   ├── AiModerationServiceImpl.java
    │   │               │   ├── AiSearchService.java
    │   │               │   ├── AiSearchServiceImpl.java
    │   │               │   ├── AiSummaryService.java
    │   │               │   ├── AiSummaryServiceImpl.java
    │   │               │   ├── BannerService.java
    │   │               │   ├── BannerServiceImpl.java
    │   │               │   ├── BoardService.java
    │   │               │   ├── BoardServiceImpl.java
    │   │               │   ├── CategoryService.java
    │   │               │   ├── CategoryServiceImpl.java
    │   │               │   ├── ClubService.java
    │   │               │   ├── ClubServiceImpl.java
    │   │               │   ├── CommentService.java
    │   │               │   ├── CommentServiceImpl.java
    │   │               │   ├── GameService.java
    │   │               │   ├── GameServiceImpl.java
    │   │               │   ├── LikeService.java
    │   │               │   ├── LikeServiceImpl.java
    │   │               │   ├── NoticeService.java
    │   │               │   ├── NoticeServiceImpl.java
    │   │               │   ├── OpenAiService.java
    │   │               │   ├── PaymentService.java
    │   │               │   ├── PaymentServiceImpl.java
    │   │               │   ├── ReportService.java
    │   │               │   ├── ReportServiceImpl.java
    │   │               │   ├── SubscriptionService.java
    │   │               │   ├── SubscriptionServiceImpl.java
    │   │               │   ├── UserService.java
    │   │               │   └── UserServiceImpl.java
    │   │               └── ServletInitializer.java
    │   └── resources
    │       ├── application-secret.properties
    │       ├── application.properties
    │       ├── mybatis
    │       │   └── mapper
    │       │       ├── AiSearchLogMapper.xml
    │       │       ├── AuthMapper.xml
    │       │       ├── BannerMapper.xml
    │       │       ├── BoardMapper.xml
    │       │       ├── CategoryMapper.xml
    │       │       ├── ClubMapper.xml
    │       │       ├── CommentMapper.xml
    │       │       ├── GameMapper.xml
    │       │       ├── LikeMapper.xml
    │       │       ├── MemberMapper.xml
    │       │       ├── Notice.xml
    │       │       ├── PaymentMapper.xml
    │       │       ├── ReportMapper.xml
    │       │       ├── SubscriptionMapper.xml
    │       │       └── UserMapper.xml
    │       └── static
    │           └── img
    │               ├── 두룹이
    │               ├── banner
    │               ├── board
    │               ├── find-password
    │               ├── icons
    │               ├── index
    │               ├── login
    │               └── signup
    └── test
        └── java
            └── com
                └── aloha
                    └── durudurub
                        └── DurudurubApplicationTests.java


### 프론트엔드 트리구조
youngaahn@Youngui-MacBookPro-2 durudurub-app % tree -L 5 -I "node_modules|dist|build|.git"
.
├── ATTRIBUTIONS.md
├── ICONS_README.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── src
│   ├── api
│   │   └── axios.ts
│   ├── App.module.css
│   ├── App.tsx
│   ├── character
│   │   ├── DurupCharacter.tsx
│   │   └── DurupLogo.tsx
│   ├── common
│   │   └── Layout.tsx
│   ├── components
│   │   ├── clubCard
│   │   │   └── CommunityCard.tsx
│   │   ├── communityCard
│   │   │   └── CommunityCard.tsx
│   │   ├── figma
│   │   │   └── ImageWithFallback.tsx
│   │   ├── footer
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageLayout.tsx
│   │   ├── games
│   │   │   ├── LadderGame.tsx
│   │   │   ├── WheelSpinnerGame.tsx
│   │   │   └── WinnerDrawGame.tsx
│   │   ├── header
│   │   │   ├── Navbar.module.css
│   │   │   └── Navbar.tsx
│   │   ├── home
│   │   │   ├── AdBanner.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   └── HeroSection.tsx
│   │   ├── icons
│   │   │   └── HappyIcon.tsx
│   │   ├── modal
│   │   │   ├── GameAdModal.tsx
│   │   │   └── SearchModal.tsx
│   │   ├── mypage
│   │   │   └── MyGroupsManagement.tsx
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       ├── use-mobile.ts
│   │       └── utils.ts
│   ├── contexts
│   │   └── AppContext.tsx
│   ├── data
│   │   └── mockCommunities.ts
│   ├── imports
│   │   └── ladder-game.js
│   ├── layouts
│   │   ├── MainLayout.tsx
│   │   └── RootLayout.tsx
│   ├── main.tsx
│   ├── pages
│   │   ├── admin
│   │   │   ├── AdminPage.module.css
│   │   │   └── AdminPage.tsx
│   │   ├── category
│   │   │   ├── CategoryPage.tsx
│   │   │   └── CategoryPageWrapper.tsx
│   │   ├── categoryList
│   │   │   ├── CategoryListPage.tsx
│   │   │   └── CategoryPage.module.css
│   │   ├── communityCreate
│   │   │   ├── CreateCommunityPage.module.css
│   │   │   ├── CreateCommunityPage.tsx
│   │   │   └── CreateCommunityPageWrapper.tsx
│   │   ├── communityDetail
│   │   │   ├── ClubDetailWrapper.tsx
│   │   │   ├── CommunityDetailPage.module.css
│   │   │   ├── CommunityDetailPage.tsx
│   │   │   └── CommunityDetailPageWrapper.tsx
│   │   ├── communityEdit
│   │   │   └── EditCommunityModal.tsx
│   │   ├── error
│   │   │   ├── Error403Page.tsx
│   │   │   ├── Error404Page.tsx
│   │   │   └── Error500Page.tsx
│   │   ├── explore
│   │   │   ├── ExplorePage.module.css
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── ExplorePageWrapper.tsx
│   │   │   └── ExploreWrapper.tsx
│   │   ├── favorites
│   │   │   ├── FavoritesPage.module.css
│   │   │   └── FavoritesPage.tsx
│   │   ├── Home.tsx
│   │   ├── HomePage.tsx
│   │   ├── login
│   │   │   ├── LoginPage.module.css
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginPageWrapper.tsx
│   │   │   └── OAuthSuccess.tsx
│   │   ├── mypage
│   │   │   ├── MyMeetingsWrapper.tsx
│   │   │   ├── MyPage.module.css
│   │   │   ├── MyPage.tsx
│   │   │   └── MyPageWrapper.tsx
│   │   ├── notice
│   │   │   ├── NoticePage.module.css
│   │   │   ├── NoticePage.tsx
│   │   │   ├── NoticePageWrapper.tsx
│   │   │   ├── NoticeWritePage.tsx
│   │   │   └── NoticeWritePageWrapper.tsx
│   │   ├── other
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── MiniGamePage.tsx
│   │   │   ├── OtherPagesWrapper.tsx
│   │   │   ├── PaymentPage.tsx
│   │   │   └── PaymentResultPage.tsx
│   │   └── signup
│   │       ├── SignupPage.tsx
│   │       └── SignupPageWrapper.tsx
│   ├── routes.tsx
│   ├── styles
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── vite-env.d.ts
├── static
│   ├── index.html
│   ├── main.js
│   ├── pages.js
│   ├── router.js
│   └── styles.css
├── supabase
│   ├── config.toml
│   └── functions
│       └── server
│           ├── deno.json
│           ├── index.tsx
│           └── kv_store.tsx
├── tsconfig.json
├── utils
│   └── supabase
│       └── info.tsx
└── vite.config.ts