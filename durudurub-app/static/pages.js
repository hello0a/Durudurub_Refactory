// 모든 페이지 템플릿

// 홈 페이지
function renderHomePage() {
  return `
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              함께 하면<br>
              더 즐거운 순간
            </h1>
            <p class="hero-description">
              관심사가 같은 사람들과 모여<br>
              새로운 경험을 만들어보세요
            </p>
            <button class="btn-explore" onclick="navigateTo('explore')">
              모임 둘러보기
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 카테고리 섹션 -->
    <section class="category-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">어떤 모임을 찾으시나요?</h2>
          <p class="section-description">관심있는 카테고리를 선택해보세요</p>
        </div>

        <div class="category-grid">
          <button class="category-item" onclick="navigateTo('category', null, {category: '자기계발'})">
            <div class="category-icon" style="background-color: #E5F3FF;">
              <i data-lucide="trending-up" style="color: #4A90E2;"></i>
            </div>
            <span class="category-name">자기계발</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '스포츠'})">
            <div class="category-icon" style="background-color: #F0E5FF;">
              <i data-lucide="dumbbell" style="color: #9B59B6;"></i>
            </div>
            <span class="category-name">스포츠</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '푸드'})">
            <div class="category-icon" style="background-color: #FFF5E5;">
              <i data-lucide="utensils" style="color: #FF8A3D;"></i>
            </div>
            <span class="category-name">푸드</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '게임'})">
            <div class="category-icon" style="background-color: #FFF0E5;">
              <i data-lucide="gamepad-2" style="color: #FF9800;"></i>
            </div>
            <span class="category-name">게임</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '동네친구'})">
            <div class="category-icon" style="background-color: #E5F9F0;">
              <i data-lucide="users" style="color: #00A651;"></i>
            </div>
            <span class="category-name">동네친구</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '여행'})">
            <div class="category-icon" style="background-color: #E5F9FF;">
              <i data-lucide="plane" style="color: #00BCD4;"></i>
            </div>
            <span class="category-name">여행</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '예술'})">
            <div class="category-icon" style="background-color: #FFE5F5;">
              <i data-lucide="palette" style="color: #E91E63;"></i>
            </div>
            <span class="category-name">예술</span>
          </button>

          <button class="category-item" onclick="navigateTo('category', null, {category: '반려동물'})">
            <div class="category-icon" style="background-color: #FFE5E5;">
              <i data-lucide="dog" style="color: #FF6B6B;"></i>
            </div>
            <span class="category-name">반려동물</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 베스트 모임 섹션 -->
    <section class="best-communities-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">인기 모임</h2>
          <p class="section-description">많은 사람들이 참여하고 있는 모임입니다</p>
        </div>

        <div class="communities-grid" id="bestCommunitiesGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </section>

    <!-- 리뷰 섹션 -->
    <section class="review-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">두루두룹 이용 후기</h2>
          <p class="section-description">실제 회원들의 생생한 이야기</p>
        </div>

        <div class="reviews-grid">
          <div class="review-card">
            <div class="review-header">
              <img src="https://ui-avatars.com/api/?name=김민지&background=00A651&color=fff" alt="김민지" class="review-avatar">
              <div class="review-user">
                <h4 class="review-name">김민지</h4>
                <div class="review-stars">★★★★★</div>
              </div>
            </div>
            <p class="review-text">
              독서 모임에서 책 이야기를 나누며 새로운 친구들을 만났어요. 
              매주 만나는 게 기다려집니다!
            </p>
            <span class="review-tag">독서 모임</span>
          </div>

          <div class="review-card">
            <div class="review-header">
              <img src="https://ui-avatars.com/api/?name=이준호&background=4A90E2&color=fff" alt="이준호" class="review-avatar">
              <div class="review-user">
                <h4 class="review-name">이준호</h4>
                <div class="review-stars">★★★★★</div>
              </div>
            </div>
            <p class="review-text">
              주말 축구 모임 덕분에 건강도 챙기고 스트레스도 풀 수 있어요. 
              운동 좋아하시는 분들께 강추!
            </p>
            <span class="review-tag">스포츠</span>
          </div>

          <div class="review-card">
            <div class="review-header">
              <img src="https://ui-avatars.com/api/?name=박서연&background=E91E63&color=fff" alt="박서연" class="review-avatar">
              <div class="review-user">
                <h4 class="review-name">박서연</h4>
                <div class="review-stars">★★★★★</div>
              </div>
            </div>
            <p class="review-text">
              요리 모임에서 레시피도 배우고 맛있는 음식도 먹고, 
              일석이조예요!
            </p>
            <span class="review-tag">푸드</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 호스트 배너 -->
    <section class="host-banner">
      <div class="container">
        <div class="banner-content">
          <h2 class="banner-title">모임을 직접 만들어보세요</h2>
          <p class="banner-description">
            당신의 취미와 관심사를 공유할 사람들을 찾아보세요
          </p>
          <button class="btn-banner" onclick="navigateTo('create')">
            모임 만들기
          </button>
        </div>
      </div>
    </section>
  `;
}

// 로그인 페이지
function renderLoginPage() {
  return `
    <div class="page-container auth-page">
      <div class="auth-card">
        <button class="btn-close" onclick="navigateTo('home')" aria-label="닫기">
          <i data-lucide="x"></i>
        </button>

        <div class="auth-header">
          <h1 class="auth-title">두루두룹</h1>
          <p class="auth-subtitle">다시 만나서 반가워요!</p>
        </div>

        <form onsubmit="handleLogin(event)" class="auth-form">
          <div id="loginError" class="error-message" style="display: none;"></div>

          <div class="form-group">
            <label for="loginUserId" class="form-label">아이디</label>
            <input
              type="text"
              id="loginUserId"
              name="userId"
              class="form-input"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="loginPassword" class="form-label">비밀번호</label>
            <div class="input-with-icon">
              <input
                type="password"
                id="loginPassword"
                name="password"
                class="form-input"
                placeholder="비밀번호를 입력하세요"
                required
              />
              <button type="button" class="icon-button" onclick="togglePasswordVisibility('loginPassword')">
                <i data-lucide="eye"></i>
              </button>
            </div>
          </div>

          <div class="form-row">
            <label class="checkbox-label">
              <input type="checkbox" name="rememberMe" />
              <span>로그인 유지</span>
            </label>
          </div>

          <button type="submit" class="btn-submit" id="loginSubmitBtn">
            로그인
          </button>

          <div class="auth-footer">
            <p class="auth-link-text">
              아직 회원이 아니신가요?
              <a href="#" onclick="navigateTo('signup', event)" class="auth-link">회원가입하기</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `;
}

// 회원가입 페이지
function renderSignupPage() {
  return `
    <div class="page-container auth-page">
      <div class="auth-card auth-card-large">
        <button class="btn-close" onclick="navigateTo('home')" aria-label="닫기">
          <i data-lucide="x"></i>
        </button>

        <div class="auth-header">
          <h1 class="auth-title">두루두룹</h1>
          <p class="auth-subtitle">새로운 만남을 시작해보세요!</p>
        </div>

        <form onsubmit="handleSignup(event)" class="auth-form">
          <div id="signupError" class="error-message" style="display: none;"></div>
          <div id="signupSuccess" class="success-message" style="display: none;"></div>

          <!-- 프로필 이미지 업로드 -->
          <div class="form-group">
            <label class="form-label">프로필 이미지 (선택)</label>
            <div class="profile-upload">
              <div class="profile-preview" id="profilePreview">
                <i data-lucide="user" class="profile-placeholder-icon"></i>
              </div>
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                style="display: none;"
                onchange="handleProfileImageChange(event)"
              />
              <button type="button" class="btn-upload" onclick="document.getElementById('profileImageInput').click()">
                <i data-lucide="upload"></i>
                이미지 선택
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="signupUserId" class="form-label">아이디 *</label>
            <input
              type="text"
              id="signupUserId"
              name="userId"
              class="form-input"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="signupPassword" class="form-label">비밀번호 * (최소 6자)</label>
            <div class="input-with-icon">
              <input
                type="password"
                id="signupPassword"
                name="password"
                class="form-input"
                placeholder="비밀번호를 입력하세요"
                required
                minlength="6"
              />
              <button type="button" class="icon-button" onclick="togglePasswordVisibility('signupPassword')">
                <i data-lucide="eye"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">비밀번호 확인 *</label>
            <div class="input-with-icon">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                class="form-input"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <button type="button" class="icon-button" onclick="togglePasswordVisibility('confirmPassword')">
                <i data-lucide="eye"></i>
              </button>
            </div>
            <span id="passwordError" class="field-error" style="display: none;"></span>
          </div>

          <div class="form-group">
            <label for="nickname" class="form-label">닉네임 *</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              class="form-input"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="gender" class="form-label">성별 (선택)</label>
            <select id="gender" name="gender" class="form-input">
              <option value="">선택하지 않음</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div class="form-group">
            <label for="address" class="form-label">주소 (선택)</label>
            <input
              type="text"
              id="address"
              name="address"
              class="form-input"
              placeholder="예: 서울특별시 강남구"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="agreeTerms" required />
              <span>이용약관에 동의합니다 (필수)</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="agreePrivacy" required />
              <span>개인정보 처리방침에 동의합니다 (필수)</span>
            </label>
          </div>

          <button type="submit" class="btn-submit" id="signupSubmitBtn">
            회원가입
          </button>

          <div class="auth-footer">
            <p class="auth-link-text">
              이미 계정이 있으신가요?
              <a href="#" onclick="navigateTo('login', event)" class="auth-link">로그인하기</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `;
}

// 모임 둘러보기 페이지
function renderExplorePage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">모임 둘러보기</h1>
        <p class="page-description">다양한 소모임을 찾아보세요</p>
      </div>

      <div class="container">
        <!-- 검색 및 필터 -->
        <div class="search-section">
          <div class="search-bar">
            <i data-lucide="search"></i>
            <input
              type="text"
              id="searchInput"
              placeholder="모임 이름, 카테고리로 검색..."
              onkeyup="handleSearchKeyup(event)"
            />
          </div>
          <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterCommunities('all')">전체</button>
            <button class="filter-btn" onclick="filterCommunities('자기계발')">자기계발</button>
            <button class="filter-btn" onclick="filterCommunities('스포츠')">스포츠</button>
            <button class="filter-btn" onclick="filterCommunities('푸드')">푸드</button>
            <button class="filter-btn" onclick="filterCommunities('게임')">게임</button>
            <button class="filter-btn" onclick="filterCommunities('동네친구')">동네친구</button>
            <button class="filter-btn" onclick="filterCommunities('여행')">여행</button>
            <button class="filter-btn" onclick="filterCommunities('예술')">예술</button>
            <button class="filter-btn" onclick="filterCommunities('반려동물')">반려동물</button>
          </div>
        </div>

        <!-- 모임 리스트 -->
        <div class="communities-grid" id="exploreCommunitiesGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 카테고리 페이지
function renderCategoryPage(category) {
  return `
    <div class="page-container">
      <div class="page-header">
        <button class="btn-back" onclick="navigateTo('home')">
          <i data-lucide="arrow-left"></i>
          돌아가기
        </button>
        <h1 class="page-title">${category} 모임</h1>
        <p class="page-description">${category} 관련 모임을 찾아보세요</p>
      </div>

      <div class="container">
        <div class="communities-grid" id="categoryCommunitiesGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 모임 상세 페이지 (기본 구조, 실제 데이터는 loadCommunityDetail에서)
function renderCommunityDetailPage() {
  return `
    <div class="page-container">
      <div id="communityDetailContent">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;
}

// 모임 만들기 페이지
function renderCreateCommunityPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <button class="btn-back" onclick="navigateTo('home')">
          <i data-lucide="arrow-left"></i>
          돌아가기
        </button>
        <h1 class="page-title">새 모임 만들기</h1>
        <p class="page-description">멋진 모임을 만들어보세요</p>
      </div>

      <div class="container">
        <div class="form-container">
          <form onsubmit="handleCreateCommunity(event)" class="create-form">
            <div id="createError" class="error-message" style="display: none;"></div>

            <div class="form-group">
              <label for="communityTitle" class="form-label">모임 이름 *</label>
              <input
                type="text"
                id="communityTitle"
                name="title"
                class="form-input"
                placeholder="모임 이름을 입력하세요"
                required
              />
            </div>

            <div class="form-group">
              <label for="communityCategory" class="form-label">카테고리 *</label>
              <select id="communityCategory" name="category" class="form-input" required>
                <option value="">선택하세요</option>
                <option value="자기계발">자기계발</option>
                <option value="스포츠">스포츠</option>
                <option value="푸드">푸드</option>
                <option value="게임">게임</option>
                <option value="동네친구">동네친구</option>
                <option value="여행">여행</option>
                <option value="예술">예술</option>
                <option value="반려동물">반려동물</option>
              </select>
            </div>

            <div class="form-group">
              <label for="communityDescription" class="form-label">모임 설명 *</label>
              <textarea
                id="communityDescription"
                name="description"
                class="form-input"
                rows="4"
                placeholder="모임에 대해 설명해주세요"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="communityLocation" class="form-label">지역 *</label>
              <input
                type="text"
                id="communityLocation"
                name="location"
                class="form-input"
                placeholder="예: 서울특별시 강남구"
                required
              />
            </div>

            <div class="form-group">
              <label for="maxMembers" class="form-label">최대 인원 *</label>
              <input
                type="number"
                id="maxMembers"
                name="maxMembers"
                class="form-input"
                min="2"
                max="100"
                value="20"
                required
              />
            </div>

            <button type="submit" class="btn-submit" id="createSubmitBtn">
              모임 만들기
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// 마이페이지
function renderMyPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">마이페이지</h1>
        <p class="page-description">나의 정보를 관리하세요</p>
      </div>

      <div class="container">
        <div id="myPageContent">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 나의 모임 페이지
function renderMyMeetingsPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">나의 모임</h1>
        <p class="page-description">참여 중인 모임을 확인하세요</p>
      </div>

      <div class="container">
        <div class="communities-grid" id="myMeetingsGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 즐겨찾기 페이지
function renderFavoritesPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">즐겨찾기</h1>
        <p class="page-description">관심있는 모임을 모아보세요</p>
      </div>

      <div class="container">
        <div class="communities-grid" id="favoritesGrid">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 공지사항 페이지
function renderNoticePage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">공지사항</h1>
        <p class="page-description">두루두룹의 새로운 소식을 확인하세요</p>
      </div>

      <div class="container">
        <div id="noticeList">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 미니게임 페이지
function renderMiniGamePage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">미니게임</h1>
        <p class="page-description">재미있는 게임으로 즐거운 시간 보내세요</p>
      </div>

      <div class="container">
        <div class="games-grid">
          <div class="game-card" onclick="playLadderGame()">
            <div class="game-icon">🪜</div>
            <h3 class="game-title">사다리 타기</h3>
            <p class="game-description">사다리 타기로 공정하게 선택하세요</p>
          </div>

          <div class="game-card" onclick="playRouletteGame()">
            <div class="game-icon">🎯</div>
            <h3 class="game-title">룰렛</h3>
            <p class="game-description">룰렛을 돌려 랜덤으로 선택하세요</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 관리자 페이지
function renderAdminPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">관리자 페이지</h1>
        <p class="page-description">시스템을 관리하세요</p>
      </div>

      <div class="container">
        <div class="admin-tabs">
          <button class="admin-tab active" onclick="switchAdminTab('dashboard')">대시보드</button>
          <button class="admin-tab" onclick="switchAdminTab('communities')">모임 관리</button>
          <button class="admin-tab" onclick="switchAdminTab('reports')">신고 관리</button>
        </div>

        <div id="adminContent">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}

// 나의 모임 관리 페이지
function renderGroupsManagementPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">나의 모임 관리</h1>
        <p class="page-description">내가 만든 모임을 관리하세요</p>
      </div>

      <div class="container">
        <div id="groupsManagementContent">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;
}