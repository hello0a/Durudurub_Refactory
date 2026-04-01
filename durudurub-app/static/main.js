// Supabase 설정
const SUPABASE_URL = 'https://izajpfynznsgcvfnauja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6YWpwZnluem5zZ2N2Zm5hdWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzM2ODIsImV4cCI6MjA4NTA0OTY4Mn0.IWbvU7kITN0u191YbmQTQS3s_TQgSKOp3_CVfVGl390';
const API_BASE = `${SUPABASE_URL}/functions/v1/make-server-12a2c4b5`;

// 전역 상태
let currentUser = null;
let accessToken = null;
let allCommunities = [];
let profileImageData = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

// 인증 초기화
function initAuth() {
  const storedToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');
  const storedProfileImage = localStorage.getItem('profileImage');

  if (storedToken && storedUser) {
    const tokenParts = storedToken.split('.');
    if (tokenParts.length === 3) {
      accessToken = storedToken;
      currentUser = JSON.parse(storedUser);
      updateAuthUI();
      
      if (storedProfileImage) {
        document.getElementById('userAvatar').src = storedProfileImage;
      } else {
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.userId)}&background=00A651&color=fff`;
      }
      document.getElementById('userName').textContent = currentUser.nickname || currentUser.userId;
      
      // 관리자 링크 표시
      if (currentUser.isAdmin) {
        document.getElementById('adminLink').style.display = 'block';
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('profileImage');
    }
  }
}

// 인증 UI 업데이트
function updateAuthUI() {
  if (currentUser && accessToken) {
    document.getElementById('beforeLogin').style.display = 'none';
    document.getElementById('afterLogin').style.display = 'flex';
  } else {
    document.getElementById('beforeLogin').style.display = 'flex';
    document.getElementById('afterLogin').style.display = 'none';
  }
}

// 사용자 메뉴 토글
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  const userProfile = document.querySelector('.user-profile');
  const dropdown = document.getElementById('userDropdown');
  
  if (userProfile && dropdown && !userProfile.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// ==================== 로그인/회원가입 ====================

// 로그인
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const userId = form.userId.value;
  const password = form.password.value;
  const submitBtn = document.getElementById('loginSubmitBtn');
  const errorDiv = document.getElementById('loginError');
  
  submitBtn.disabled = true;
  submitBtn.textContent = '로그인 중...';
  errorDiv.style.display = 'none';
  
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ userId, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      accessToken = data.accessToken;
      currentUser = data.user;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      if (currentUser.profileImage) {
        localStorage.setItem('profileImage', currentUser.profileImage);
      }
      
      updateAuthUI();
      document.getElementById('userAvatar').src = currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.userId)}&background=00A651&color=fff`;
      document.getElementById('userName').textContent = currentUser.nickname || currentUser.userId;
      
      if (currentUser.isAdmin) {
        document.getElementById('adminLink').style.display = 'block';
      }
      
      alert('로그인 성공!');
      navigateTo('home');
    } else {
      errorDiv.textContent = data.error || '로그인에 실패했습니다.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    errorDiv.textContent = '서버 연결에 실패했습니다.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '로그인';
  }
}

// 회원가입
async function handleSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const submitBtn = document.getElementById('signupSubmitBtn');
  const errorDiv = document.getElementById('signupError');
  const successDiv = document.getElementById('signupSuccess');
  const passwordError = document.getElementById('passwordError');
  
  passwordError.style.display = 'none';
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  if (password !== confirmPassword) {
    passwordError.textContent = '비밀번호가 일치하지 않습니다.';
    passwordError.style.display = 'block';
    return;
  }
  
  if (password.length < 6) {
    passwordError.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
    passwordError.style.display = 'block';
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = '회원가입 중...';
  
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId: form.userId.value,
        password: password,
        nickname: form.nickname.value,
        gender: form.gender.value,
        address: form.address.value,
        profileImage: profileImageData
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      successDiv.textContent = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.';
      successDiv.style.display = 'block';
      setTimeout(() => {
        navigateTo('login');
      }, 2000);
    } else {
      errorDiv.textContent = data.error || '회원가입에 실패했습니다.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    errorDiv.textContent = '서버 연결에 실패했습니다.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '회원가입';
  }
}

// 프로필 이미지 변경
function handleProfileImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImageData = e.target.result;
    const preview = document.getElementById('profilePreview');
    preview.innerHTML = `<img src="${profileImageData}" alt="프로필 미리보기" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
  };
  reader.readAsDataURL(file);
}

// 비밀번호 표시/숨김
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.icon-button');
  
  if (input.type === 'password') {
    input.type = 'text';
    button.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = 'password';
    button.innerHTML = '<i data-lucide="eye"></i>';
  }
  
  lucide.createIcons();
}

// 로그아웃
async function handleLogout(event) {
  if (event) event.preventDefault();
  
  try {
    if (accessToken) {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
  }
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('profileImage');
  
  currentUser = null;
  accessToken = null;
  profileImageData = null;
  
  updateAuthUI();
  alert('로그아웃되었습니다.');
  navigateTo('home');
}

// ==================== 모임 관련 ====================

// 베스트 모임 로드
async function loadBestCommunities() {
  const grid = document.getElementById('bestCommunitiesGrid');
  if (!grid) return;
  
  try {
    const response = await fetch(`${API_BASE}/communities`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const communities = data.communities || [];
      allCommunities = communities;
      
      const bestCommunities = communities.slice(0, 3);
      
      if (bestCommunities.length === 0) {
        grid.innerHTML = '<p class="empty-message">등록된 모임이 없습니다.</p>';
        return;
      }
      
      grid.innerHTML = bestCommunities.map(community => createCommunityCard(community)).join('');
      lucide.createIcons();
    } else {
      grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('베스트 모임 로드 실패:', error);
    grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
  }
}

// 모든 모임 로드 (둘러보기 페이지)
async function loadAllCommunities() {
  const grid = document.getElementById('exploreCommunitiesGrid');
  if (!grid) return;
  
  try {
    const response = await fetch(`${API_BASE}/communities`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const communities = data.communities || [];
      allCommunities = communities;
      
      if (communities.length === 0) {
        grid.innerHTML = '<p class="empty-message">등록된 모임이 없습니다.</p>';
        return;
      }
      
      grid.innerHTML = communities.map(community => createCommunityCard(community)).join('');
      lucide.createIcons();
    } else {
      grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('모임 로드 실패:', error);
    grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
  }
}

// 카테고리별 모임 로드
async function loadCategoryCommunitie(category) {
  const grid = document.getElementById('categoryCommunitiesGrid');
  if (!grid) return;
  
  try {
    const response = await fetch(`${API_BASE}/communities`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const communities = data.communities || [];
      const filtered = communities.filter(c => c.category === category);
      
      if (filtered.length === 0) {
        grid.innerHTML = `<p class="empty-message">${category} 카테고리에 등록된 모임이 없습니다.</p>`;
        return;
      }
      
      grid.innerHTML = filtered.map(community => createCommunityCard(community)).join('');
      lucide.createIcons();
    } else {
      grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('카테고리 모임 로드 실패:', error);
    grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
  }
}

// 모임 카드 생성
function createCommunityCard(community) {
  return `
    <div class="community-card" onclick="navigateTo('community', null, {communityId: '${community.id}'})">
      <img 
        src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400" 
        alt="${community.title}"
        class="community-image"
        onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'"
      >
      <div class="community-content">
        <h3 class="community-title">${community.title}</h3>
        <p class="community-description">${community.description || '함께 즐거운 시간을 보내요!'}</p>
        <div class="community-meta">
          <div class="community-meta-item">
            <i data-lucide="map-pin"></i>
            ${community.location || '서울'}
          </div>
          <div class="community-meta-item">
            <i data-lucide="tag"></i>
            ${community.category || '기타'}
          </div>
        </div>
        <div class="community-footer">
          <span class="community-host">호스트: ${community.hostName || community.hostId || '익명'}</span>
          <span class="community-participants">${community.memberCount || 0}/${community.maxMembers || 20}명</span>
        </div>
      </div>
    </div>
  `;
}

// 모임 상세 로드
async function loadCommunityDetail(communityId) {
  const container = document.getElementById('communityDetailContent');
  if (!container) return;
  
  try {
    const response = await fetch(`${API_BASE}/communities/${communityId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const community = data.community;
      
      container.innerHTML = `
        <div class="community-detail">
          <button class="btn-back" onclick="navigateTo('explore')">
            <i data-lucide="arrow-left"></i>
            돌아가기
          </button>
          
          <div class="community-detail-header">
            <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800" alt="${community.title}" class="community-detail-image">
            <div class="community-detail-info">
              <h1 class="community-detail-title">${community.title}</h1>
              <p class="community-detail-category"><i data-lucide="tag"></i> ${community.category}</p>
              <p class="community-detail-location"><i data-lucide="map-pin"></i> ${community.location}</p>
              <p class="community-detail-members"><i data-lucide="users"></i> ${community.memberCount}/${community.maxMembers}명</p>
            </div>
          </div>
          
          <div class="community-detail-body">
            <h2>모임 소개</h2>
            <p>${community.description || '함께 즐거운 시간을 보내요!'}</p>
            
            ${currentUser ? `
              <button class="btn-submit" onclick="joinCommunity('${community.id}')">
                모임 가입하기
              </button>
            ` : `
              <button class="btn-submit" onclick="navigateTo('login')">
                로그인하고 가입하기
              </button>
            `}
          </div>
        </div>
      `;
      lucide.createIcons();
    } else {
      container.innerHTML = '<p class="error-message">모임 정보를 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('모임 상세 로드 실패:', error);
    container.innerHTML = '<p class="error-message">모임 정보를 불러오는데 실패했습니다.</p>';
  }
}

// 모임 가입
async function joinCommunity(communityId) {
  if (!currentUser) {
    alert('로그인이 필요��니다.');
    navigateTo('login');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/communities/${communityId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('가입 신청이 완료되었습니다! 리더의 승인을 기다려주세요.');
      loadCommunityDetail(communityId);
    } else {
      alert(data.error || '가입 신청에 실패했습니다.');
    }
  } catch (error) {
    console.error('모임 가입 오류:', error);
    alert('가입 신청 중 오류가 발생했습니다.');
  }
}

// 모임 생성
async function handleCreateCommunity(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = document.getElementById('createSubmitBtn');
  const errorDiv = document.getElementById('createError');
  
  submitBtn.disabled = true;
  submitBtn.textContent = '생성 중...';
  errorDiv.style.display = 'none';
  
  try {
    const response = await fetch(`${API_BASE}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: form.title.value,
        category: form.category.value,
        description: form.description.value,
        location: form.location.value,
        maxMembers: parseInt(form.maxMembers.value)
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('모임이 생성되었습니다!');
      navigateTo('community', null, { communityId: data.communityId });
    } else {
      errorDiv.textContent = data.error || '모임 생성에 실패했습니다.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('모임 생성 오류:', error);
    errorDiv.textContent = '모임 생성 중 오류가 발생했습니다.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '모임 만들기';
  }
}

// 검색 및 필터링
function handleSearchKeyup(event) {
  if (event.key === 'Enter') {
    const query = event.target.value.toLowerCase();
    const filtered = allCommunities.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.category.toLowerCase().includes(query)
    );
    displayFilteredCommunities(filtered);
  }
}

function filterCommunities(category) {
  // 필터 버튼 active 클래스 변경
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  let filtered;
  if (category === 'all') {
    filtered = allCommunities;
  } else {
    filtered = allCommunities.filter(c => c.category === category);
  }
  displayFilteredCommunities(filtered);
}

function displayFilteredCommunities(communities) {
  const grid = document.getElementById('exploreCommunitiesGrid');
  if (!grid) return;
  
  if (communities.length === 0) {
    grid.innerHTML = '<p class="empty-message">검색 결과가 없습니다.</p>';
    return;
  }
  
  grid.innerHTML = communities.map(community => createCommunityCard(community)).join('');
  lucide.createIcons();
}

// ==================== 사용자 페이지 ====================

// 마이페이지 로드
async function loadMyPageData() {
  const container = document.getElementById('myPageContent');
  if (!container || !currentUser) return;
  
  container.innerHTML = `
    <div class="mypage-card">
      <div class="mypage-header">
        <img src="${currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.userId)}&background=00A651&color=fff`}" alt="프로필" class="mypage-avatar">
        <div class="mypage-info">
          <h2>${currentUser.nickname || currentUser.userId}</h2>
          <p>${currentUser.userId}</p>
          ${currentUser.address ? `<p><i data-lucide="map-pin"></i> ${currentUser.address}</p>` : ''}
        </div>
      </div>
      
      <div class="mypage-menu">
        <button class="mypage-menu-item" onclick="navigateTo('meetings')">
          <i data-lucide="calendar"></i>
          <span>나의 모임</span>
        </button>
        <button class="mypage-menu-item" onclick="navigateTo('favorites')">
          <i data-lucide="heart"></i>
          <span>즐겨찾기</span>
        </button>
        <button class="mypage-menu-item" onclick="navigateTo('groups-management')">
          <i data-lucide="settings"></i>
          <span>모임 관리</span>
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// 나의 모임 로드
async function loadMyMeetings() {
  const grid = document.getElementById('myMeetingsGrid');
  if (!grid || !currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/my-communities`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const communities = data.communities || [];
      
      if (communities.length === 0) {
        grid.innerHTML = '<p class="empty-message">참여 중인 모임이 없습니다.</p>';
        return;
      }
      
      grid.innerHTML = communities.map(community => createCommunityCard(community)).join('');
      lucide.createIcons();
    } else {
      grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('나의 모임 로드 실패:', error);
    grid.innerHTML = '<p class="error-message">모임을 불러오는데 실패했습니다.</p>';
  }
}

// 즐겨찾기 로드
async function loadFavorites() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid || !currentUser) return;
  
  grid.innerHTML = '<p class="empty-message">즐겨찾기한 모임이 없습니다.</p>';
}

// 모임 관리 로드
async function loadGroupsManagement() {
  const container = document.getElementById('groupsManagementContent');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p class="empty-message">관리 중인 모임이 없습니다.</p>';
}

// ==================== 공지사항 ====================

async function loadNotices() {
  const container = document.getElementById('noticeList');
  if (!container) return;
  
  try {
    const response = await fetch(`${API_BASE}/notices`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const notices = data.notices || [];
      
      if (notices.length === 0) {
        container.innerHTML = '<p class="empty-message">등록된 공지사항이 없습니다.</p>';
        return;
      }
      
      container.innerHTML = `
        <div class="notice-list">
          ${notices.map(notice => `
            <div class="notice-item">
              <h3 class="notice-title">${notice.title}</h3>
              <p class="notice-content">${notice.content}</p>
              <p class="notice-date">${new Date(notice.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = '<p class="error-message">공지사항을 불러오는데 실패했습니다.</p>';
    }
  } catch (error) {
    console.error('공지사항 로드 실패:', error);
    container.innerHTML = '<p class="error-message">공지사항을 불러오는데 실패했습니다.</p>';
  }
}

// ==================== 미니게임 ====================

function playLadderGame() {
  alert('사다리 타기 게임을 시작합니다!\n\n실제 구현에서는 인터랙티브한 사다리 타기 게임을 제공합니다.');
}

function playRouletteGame() {
  alert('룰렛 게임을 시작합니다!\n\n실제 구현에서는 인터랙티브한 룰렛 게임을 제공합니다.');
}

// ==================== 관리자 ====================

let currentAdminTab = 'dashboard';
let adminCommunities = [];

async function loadAdminData() {
  currentAdminTab = 'dashboard';
  renderAdminDashboard();
}

function switchAdminTab(tab) {
  currentAdminTab = tab;
  
  // 탭 활성화 상태 변경
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 탭별 렌더링
  switch(tab) {
    case 'dashboard':
      renderAdminDashboard();
      break;
    case 'communities':
      renderAdminCommunities();
      break;
    case 'reports':
      renderAdminReports();
      break;
    case 'users':
      renderAdminUsers();
      break;
  }
}

// 대시보드
function renderAdminDashboard() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #E5F3FF; color: #4A90E2;">
            <i data-lucide="users"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">1,234</h3>
            <p class="stat-label">총 회원 수</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #E5F9F0; color: #00A651;">
            <i data-lucide="calendar"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">87</h3>
            <p class="stat-label">활성 모임</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #FFF5E5; color: #FF8A3D;">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-value">12</h3>
            <p class="stat-label">미처리 신고</p>
          </div>
        </div>
      </div>
      
      <div class="admin-info">
        <h3>시스템 개요</h3>
        <p>관리자 페이지에 오신 것을 환영합니다.</p>
        <p>좌측 탭에서 모임 관리, 신고 관리 등을 수행할 수 있습니다.</p>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// 모임 관리
async function renderAdminCommunities() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-section">
      <h3 class="admin-section-title">모임 관리</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>모임명</th>
              <th>카테고리</th>
              <th>리더</th>
              <th>회원수</th>
              <th>생성일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody id="adminCommunitiesTable">
            <tr>
              <td colspan="7" class="loading-cell">
                <div class="spinner"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // 모임 목록 로드
  await loadAdminCommunitiesList();
  
  // 이벤트 위임 방식으로 클릭 이벤트 처리
  const tableBody = document.getElementById('adminCommunitiesTable');
  if (tableBody) {
    tableBody.addEventListener('click', handleAdminTableClick);
  }
  
  // 드롭다운 외부 클릭 닫기
  document.addEventListener('click', closeAllDropdowns);
}

// 테이블 클릭 핸들러
function handleAdminTableClick(event) {
  const target = event.target;
  
  // 작업 버튼 클릭
  if (target.closest('.action-btn')) {
    event.stopPropagation();
    const btn = target.closest('.action-btn');
    const dropdownId = btn.getAttribute('data-dropdown');
    toggleActionDropdownById(dropdownId);
    return;
  }
  
  // 모임 상세 보기 클릭
  if (target.closest('.view-community-btn')) {
    const communityId = target.closest('.view-community-btn').getAttribute('data-id');
    viewCommunityDetail(communityId);
    return;
  }
  
  // 모임 삭제 클릭
  if (target.closest('.delete-community-btn')) {
    const communityId = target.closest('.delete-community-btn').getAttribute('data-id');
    const communityTitle = target.closest('.delete-community-btn').getAttribute('data-title');
    deleteCommunity(communityId, communityTitle);
    return;
  }
}

// 모든 드롭다운 닫기
function closeAllDropdowns(event) {
  if (!event.target.closest('.action-dropdown-container')) {
    document.querySelectorAll('.action-dropdown').forEach(d => {
      d.style.display = 'none';
    });
  }
}

async function loadAdminCommunitiesList() {
  const tbody = document.getElementById('adminCommunitiesTable');
  if (!tbody) return;
  
  try {
    const response = await fetch(`${API_BASE}/communities`, {
      headers: {
        'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      adminCommunities = data.communities || [];
      
      if (adminCommunities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">등록된 모임이 없습니다.</td></tr>';
        return;
      }
      
      tbody.innerHTML = adminCommunities.map((community, index) => `
        <tr>
          <td>${community.id}</td>
          <td>${community.title}</td>
          <td>${community.category || '미분류'}</td>
          <td>${community.hostName || community.hostId || '익명'}</td>
          <td>${community.memberCount || 0}/${community.maxMembers || 20}</td>
          <td>${new Date(community.createdAt).toLocaleDateString('ko-KR')}</td>
          <td>
            <div class="action-dropdown-container">
              <button class="action-btn" data-dropdown="dropdown-community-${index}">
                <i data-lucide="more-vertical"></i>
              </button>
              <div class="action-dropdown" id="dropdown-community-${index}" style="display: none;">
                <button class="view-community-btn" data-id="${community.id}">
                  <i data-lucide="eye"></i>
                  모임 상세 보기
                </button>
                <button class="delete-community-btn delete-action" data-id="${community.id}" data-title="${community.title}">
                  <i data-lucide="trash-2"></i>
                  모임 삭제
                </button>
              </div>
            </div>
          </td>
        </tr>
      `).join('');
      
      lucide.createIcons();
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="error-cell">모임을 불러오는데 실패했습니다.</td></tr>';
    }
  } catch (error) {
    console.error('관리자 모임 목록 로드 실패:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="error-cell">모임을 불러오는데 실패했습니다.</td></tr>';
  }
}

// 작업 드롭다운 토글
function toggleActionDropdownById(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  
  // 다른 드롭다운 닫기
  document.querySelectorAll('.action-dropdown').forEach(d => {
    if (d.id !== dropdownId) {
      d.style.display = 'none';
    }
  });
  
  // 현재 드롭다운 토글
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// 작업 드롭다운 토글 (기존 함수 유지 - 다른 곳에서 사용할 수 있음)
function toggleActionDropdown(id, event) {
  if (event) {
    event.stopPropagation();
  }
  toggleActionDropdownById(`dropdown-${id}`);
}

// 드롭다운 외부 클릭 시 닫기 (기존 코드 제거 - renderAdminCommunities에서 처리)
// document.addEventListener('click', (e) => {
//   if (!e.target.closest('.action-dropdown-container')) {
//     document.querySelectorAll('.action-dropdown').forEach(d => {
//       d.style.display = 'none';
//     });
//   }
// });

// 모임 상세 보기
function viewCommunityDetail(communityId) {
  navigateTo('community', null, { communityId });
}

// 모임 삭제
async function deleteCommunity(communityId, communityTitle) {
  if (!confirm(`정말로 "${communityTitle}" 모임을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/communities/${communityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('모임이 삭제되었습니다.');
      loadAdminCommunitiesList();
    } else {
      alert(data.error || '모임 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('모임 삭제 오류:', error);
    alert('모임 삭제 중 오류가 발생했습니다.');
  }
}

// 신고 관리
function renderAdminReports() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-section">
      <h3 class="admin-section-title">신고 접수 관리</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>신고자</th>
              <th>신고 대상</th>
              <th>사유</th>
              <th>접수일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>박음악</td>
              <td>독서 모임 - 부적절한 게시글</td>
              <td>욕설 및 비방</td>
              <td>2024-07-20</td>
              <td><span class="status-badge status-pending">대기중</span></td>
              <td>
                <button class="btn-action" onclick="handleReport('1', 'resolve')">처리하기</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>정요리</td>
              <td>조깅 모임 - 스팸 홍보</td>
              <td>스팸/홍보</td>
              <td>2024-07-18</td>
              <td><span class="status-badge status-resolved">처리완료</span></td>
              <td>-</td>
            </tr>
            <tr>
              <td>3</td>
              <td>최여행</td>
              <td>기타 동호회 - 사용자 kimdokseo</td>
              <td>사기 의심</td>
              <td>2024-07-15</td>
              <td><span class="status-badge status-pending">대기중</span></td>
              <td>
                <button class="btn-action" onclick="handleReport('3', 'resolve')">처리하기</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleReport(reportId, action) {
  if (action === 'resolve') {
    if (confirm('이 신고를 처리 완료하시겠습니까?')) {
      alert('신고가 처리되었습니다.');
      renderAdminReports();
    }
  }
}

// 사용자 관리
function renderAdminUsers() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  
  container.innerHTML = `
    <div class="admin-section">
      <h3 class="admin-section-title">사용자 관리</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>사용자명</th>
              <th>이메일</th>
              <th>가입일</th>
              <th>권한</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody id="adminUsersTable">
            <tr>
              <td colspan="5" class="loading-cell">
                <div class="spinner"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // 사용자 목록 로드
  loadAdminUsersList();
  
  // 이벤트 위임
  const tableBody = document.getElementById('adminUsersTable');
  if (tableBody) {
    tableBody.addEventListener('click', handleAdminUsersTableClick);
  }
  
  // 드롭다운 외부 클릭 닫기
  document.addEventListener('click', closeAllDropdowns);
}

// 사용자 테이블 클릭 핸들러
function handleAdminUsersTableClick(event) {
  const target = event.target;
  
  // 작업 버튼 클릭 - SVG 아이콘 클릭도 감지하도록 수정
  const actionBtn = target.closest('.action-btn');
  if (actionBtn) {
    event.stopPropagation();
    const dropdownId = actionBtn.getAttribute('data-dropdown');
    console.log('클릭된 드롭다운 ID:', dropdownId); // 디버깅용
    toggleActionDropdownById(dropdownId);
    return;
  }
  
  // 상세 정보 보기
  if (target.closest('.view-user-detail-btn')) {
    const userData = target.closest('.view-user-detail-btn').getAttribute('data-user');
    viewUserDetail(JSON.parse(userData));
    closeAllDropdowns(event);
    return;
  }
  
  // 구독 권한 변경
  if (target.closest('.toggle-subscription-btn')) {
    const userId = target.closest('.toggle-subscription-btn').getAttribute('data-id');
    const username = target.closest('.toggle-subscription-btn').getAttribute('data-username');
    toggleUserSubscription(userId, username);
    closeAllDropdowns(event);
    return;
  }
  
  // 사용자 삭제
  if (target.closest('.delete-user-btn')) {
    const userId = target.closest('.delete-user-btn').getAttribute('data-id');
    const username = target.closest('.delete-user-btn').getAttribute('data-username');
    deleteUser(userId, username);
    closeAllDropdowns(event);
    return;
  }
}

async function loadAdminUsersList() {
  const tbody = document.getElementById('adminUsersTable');
  if (!tbody) return;
  
  // 샘플 데이터 (실제로는 API 호출)
  const sampleUsers = [
    {
      id: '1',
      username: '관리자',
      email: 'admin',
      createdAt: '2024-01-15T09:00:00Z',
      isAdmin: true,
      isSubscribed: true,
    },
    {
      id: '2',
      username: '테스트유저',
      email: 'test',
      createdAt: '2024-02-20T14:30:00Z',
      isAdmin: false,
      isSubscribed: true,
    },
    {
      id: '3',
      username: '김독서',
      email: 'kimdokseo',
      createdAt: '2024-03-15T16:45:00Z',
      isAdmin: false,
      isSubscribed: false,
    },
    {
      id: '4',
      username: '이운동',
      email: 'leeundong',
      createdAt: '2024-04-01T10:10:00Z',
      isAdmin: false,
      isSubscribed: true,
    },
    {
      id: '5',
      username: '박음악',
      email: 'parkeumak',
      createdAt: '2024-04-12T13:25:00Z',
      isAdmin: false,
      isSubscribed: false,
    },
  ];
  
  tbody.innerHTML = sampleUsers.map((user, index) => {
    const userJson = JSON.stringify(user).replace(/"/g, '&quot;');
    return `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
        <td>
          <span class="status-badge ${user.isAdmin ? 'status-admin' : user.isSubscribed ? 'status-subscribed' : 'status-user'}">
            ${user.isAdmin ? '관리자' : user.isSubscribed ? '구독 사용자' : '일반 사용자'}
          </span>
        </td>
        <td>
          <div class="action-dropdown-container">
            <button class="action-btn" data-dropdown="dropdown-user-${index}">
              <i data-lucide="more-vertical"></i>
            </button>
            <div class="action-dropdown" id="dropdown-user-${index}" style="display: none;">
              <button class="view-user-detail-btn" data-user="${userJson}">
                <i data-lucide="eye"></i>
                상세 정보 보기
              </button>
              ${!user.isAdmin ? `
                <button class="toggle-subscription-btn" data-id="${user.id}" data-username="${user.username}">
                  <i data-lucide="shield"></i>
                  구독 권한 변경
                </button>
                <button class="delete-user-btn delete-action" data-id="${user.id}" data-username="${user.username}">
                  <i data-lucide="trash-2"></i>
                  삭제
                </button>
              ` : ''}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  lucide.createIcons();
}

// 사용자 상세 정보 보기
function viewUserDetail(user) {
  const modalHTML = `
    <div class="modal-overlay" id="userDetailModal" onclick="closeUserDetailModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>사용자 상세 정보</h3>
          <button class="modal-close-btn" onclick="closeUserDetailModal()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-detail-info">
            <div class="user-detail-row">
              <span class="user-detail-label">사용자명:</span>
              <span class="user-detail-value">${user.username}</span>
            </div>
            <div class="user-detail-row">
              <span class="user-detail-label">이메일:</span>
              <span class="user-detail-value">${user.email}</span>
            </div>
            <div class="user-detail-row">
              <span class="user-detail-label">가입일:</span>
              <span class="user-detail-value">${new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div class="user-detail-row">
              <span class="user-detail-label">권한:</span>
              <span class="user-detail-value">
                <span class="status-badge ${user.isAdmin ? 'status-admin' : user.isSubscribed ? 'status-subscribed' : 'status-user'}">
                  ${user.isAdmin ? '관리자' : user.isSubscribed ? '구독 사용자' : '일반 사용자'}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-close" onclick="closeUserDetailModal()">닫기</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  lucide.createIcons();
}

function closeUserDetailModal(event) {
  if (event && event.target.id !== 'userDetailModal') return;
  const modal = document.getElementById('userDetailModal');
  if (modal) {
    modal.remove();
  }
}

// 구독 권한 변경
function toggleUserSubscription(userId, username) {
  if (confirm(`${username} 사용자의 구독 권한을 변경하시겠습니까?`)) {
    alert('구독 권한이 변경되었습니다.');
    loadAdminUsersList();
  }
}

// 사용자 삭제
function deleteUser(userId, username) {
  if (confirm(`정말로 "${username}" 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    alert('사용자가 삭제되었습니다.');
    loadAdminUsersList();
  }
}

function handleUserAction(userId, action) {
  if (action === 'ban') {
    if (confirm('이 사용자를 차단하시겠습니까?')) {
      alert('사용자가 차단되었습니다.');
      renderAdminUsers();
    }
  }
}