// 라우터 시스템

// 현재 페이지 상태
let currentPage = 'home';
let pageData = {};

// 페이지 이동 함수
function navigateTo(page, event, data = {}) {
  if (event) {
    event.preventDefault();
  }
  
  // 사용자 드롭다운 닫기
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
  
  // 로그인이 필요한 페이지 체크
  const requiresAuth = ['create', 'mypage', 'meetings', 'favorites', 'groups-management'];
  if (requiresAuth.includes(page) && !currentUser) {
    alert('로그인이 필요한 서비스입니다.');
    navigateTo('login');
    return;
  }
  
  // 관리자 페이지 체크
  if (page === 'admin' && (!currentUser || !currentUser.isAdmin)) {
    alert('관리자만 접근할 수 있습니다.');
    return;
  }
  
  currentPage = page;
  pageData = data;
  
  // 페이지 렌더링
  renderPage();
  
  // 스크롤 맨 위로
  window.scrollTo(0, 0);
}

// 페이지 렌더링
function renderPage() {
  const app = document.getElementById('app');
  
  switch (currentPage) {
    case 'home':
      app.innerHTML = renderHomePage();
      loadBestCommunities();
      break;
    case 'login':
      app.innerHTML = renderLoginPage();
      break;
    case 'signup':
      app.innerHTML = renderSignupPage();
      break;
    case 'explore':
      app.innerHTML = renderExplorePage();
      loadAllCommunities();
      break;
    case 'category':
      app.innerHTML = renderCategoryPage(pageData.category);
      loadCategoryCommunitie(pageData.category);
      break;
    case 'community':
      app.innerHTML = renderCommunityDetailPage();
      loadCommunityDetail(pageData.communityId);
      break;
    case 'create':
      app.innerHTML = renderCreateCommunityPage();
      break;
    case 'mypage':
      app.innerHTML = renderMyPage();
      loadMyPageData();
      break;
    case 'meetings':
      app.innerHTML = renderMyMeetingsPage();
      loadMyMeetings();
      break;
    case 'favorites':
      app.innerHTML = renderFavoritesPage();
      loadFavorites();
      break;
    case 'groups-management':
      app.innerHTML = renderGroupsManagementPage();
      loadGroupsManagement();
      break;
    case 'notice':
      app.innerHTML = renderNoticePage();
      loadNotices();
      break;
    case 'minigame':
      app.innerHTML = renderMiniGamePage();
      break;
    case 'admin':
      app.innerHTML = renderAdminPage();
      loadAdminData();
      break;
    default:
      app.innerHTML = renderHomePage();
      loadBestCommunities();
  }
  
  // Lucide 아이콘 재초기화
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    currentPage = event.state.page;
    pageData = event.state.data || {};
    renderPage();
  }
});

// 초기 페이지 로드
window.addEventListener('DOMContentLoaded', () => {
  // URL 해시 기반 라우팅
  const hash = window.location.hash.slice(1);
  if (hash) {
    navigateTo(hash);
  } else {
    renderPage();
  }
});
