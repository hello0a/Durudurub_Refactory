import { ArrowLeft, User, Mail, Calendar, MapPin, Edit2, Heart, Users, AlertTriangle, Crown, Sparkles, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

interface MyPageProps {
  onBack: () => void;
  user: any;
  premiumEndDate?: string | null;
  profileImage?: string | null;
  onProfileImageUpdate?: (newImage: string | null) => void;
  onNavigateToGroupsManagement?: () => void;
  onNavigateToFavorites?: () => void;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onNoticeClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  onLogout?: () => void;
  onPaymentClick?: () => void;
}

export function MyPage({ 
  onBack, 
  user, 
  premiumEndDate,
  profileImage: initialProfileImage, 
  onProfileImageUpdate, 
  onNavigateToGroupsManagement,
  onNavigateToFavorites,
  onSignupClick,
  onLoginClick,
  onLogoClick,
  onNoticeClick,
  onMiniGameClick,
  onMyMeetingsClick,
  onLogout,
  onPaymentClick
}: MyPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(initialProfileImage || null);
  const [userInfo, setUserInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [totalMyClub, setTotalMyClub] = useState<number>(0);
  const [totalFavorite, setTotalFavorite] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgError, setImgError] = useState(false);
  const { setUser } = useApp();
  

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

  useEffect(() => {
  const fetchUser = async () => {
    const token = sessionStorage.getItem('accessToken');
    const res = await fetch('/api/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const data = await res.json();

    const resolvedImage = resolveProfileImageUrl(data.profileImg);
    if (resolvedImage) {
      setProfileImage(resolvedImage);
      onProfileImageUpdate?.(resolvedImage);
    }
  };

  fetchUser();
}, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      const token = sessionStorage.getItem('accessToken');

      const res = await fetch('/api/users/mypage/api/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();

      console.log("subscription:", data);

      setUser((prevUser) => {
        if (!prevUser) return prevUser;

        const nextUser = {
          ...prevUser,
          isPremium: data.isPremium,
          premiumEndDate: data.endDate,
        };

        sessionStorage.setItem('user', JSON.stringify(nextUser));
        return nextUser;
      });
    };

    fetchSubscription();
  }, []);

  // 성별 영어 -> 한글 변환 함수
  const convertGenderToKorean = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'male': '남성',
      'female': '여성',
      'other': '기타',
      '남성': '남성',
      '여성': '여성',
      '기타': '기타'
    };
    return genderMap[gender?.toLowerCase()] || gender;
  };

  // 성별 한글 -> 영어 변환 함수
  const convertGenderToEnglish = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      '남성': 'male',
      '여성': 'female',
      '기타': 'other',
      'male': 'male',
      'female': 'female',
      'other': 'other'
    };
    return genderMap[gender] || gender;
  };

  const [editedUser, setEditedUser] = useState({
    username: user?.username || '사용자',
    address: user?.address || '',
    age: user?.age || '',
    gender: convertGenderToKorean(user?.gender || ''),
    profileImage:  user?.profileImage || '',
    createdAt: user?.createdAt || ''
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    try {
      console.log("loadUserInfo =====> ", user);
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/users/mypage/userinfo`, { headers });
      console.log("res ??? ", res);
      const userData = await res.json();
      console.log("userData ????? ", userData?.userInfo);
      setUserInfo(userData?.userInfo || {});
      setTotalMyClub(userData?.totalMyClub || 0);
      setTotalFavorite(userData?.totalFavorite || 0);

      console.log("createdAt raw >>>>> ", editedUser.createdAt);
      console.log("date parse >>>>> ", new Date(editedUser.createdAt));
    } catch (error) {
      console.error('사용자 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditedUser({
      username: userInfo.username || '사용자',
      address: userInfo.address || '',
      age: userInfo.age || '',
      gender: convertGenderToKorean(userInfo.gender || ''),
      profileImage: userInfo.profileImage || '',
      createdAt: userInfo.createdAt || ''
    });
  }, [userInfo]);

  const cleanProfileImage =
    profileImage && profileImage !== 'null'
      ? profileImage.trim()
      : '';

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append("username", editedUser.username);
      formData.append("address", editedUser.address);
      formData.append("age", editedUser.age);
      formData.append("gender", editedUser.gender);
      if (imageFile) {
        formData.append("profileImage", imageFile); // ⭐ 파일 넣기
      }

      const res = await fetch(`/api/users/mypage/userUpdate`, {
        method: 'POST',
        headers: {
          Authorization : `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("프로필 수정 실패");
      const data = await res.json();
      console.log("수정 완료", data);
      
      if (data.profileImgUrl) {
        setProfileImage(data.profileImgUrl);
        onProfileImageUpdate?.(data.profileImgUrl);
      }
      setIsEditing(false);

    } catch (error) {
      console.log(error);
    }

  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일을 읽어서 미리보기
      const reader = new FileReader();
      setImageFile(file); // ⭐ 실제 파일 저장

      reader.onloadend = () => {
        setImgError(false);
        setProfileImage(reader.result as string);
        console.log("editedUser ::: ", editedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('accessToken')
      
      const res = await fetch (`/api/users/mypage/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log("userDelete Error : ", res)
      }

      sessionStorage.removeItem('accessToken');
      onLogout?.();
      onLogoClick?.();

    } catch (error) {
      console.log("회원 탈퇴 Error..... ", error);
    }
  }

  const resolvedPremiumEndDate = premiumEndDate || user?.premiumEndDate || null;

  const formattedNextPaymentDate = resolvedPremiumEndDate
    ? new Date(resolvedPremiumEndDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '갱신일 정보 없음';

  const isPremiumUser = Boolean(user?.isPremium);
  const accentTextClass = isPremiumUser ? 'text-[#7C3AED] hover:text-[#6D28D9]' : 'text-[#00A651] hover:text-[#008f46]';
  const accentBgClass = isPremiumUser ? 'bg-[#7C3AED] hover:bg-[#6D28D9]' : 'bg-[#00A651] hover:bg-[#008f46]';
  const accentFocusRingClass = isPremiumUser ? 'focus:ring-[#7C3AED]' : 'focus:ring-[#00A651]';
  const accentStatClass = isPremiumUser ? 'text-[#7C3AED]' : 'text-[#00A651]';
  const profileGradientClass = isPremiumUser ? 'from-[#7C3AED] to-[#6D28D9]' : 'from-[#00A651] to-[#008f46]';

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* 모바일 뒤로가기 버튼 */}
      <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className={`flex items-center justify-center text-gray-700 transition-colors ${accentTextClass}`}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 멤버십 정보 카드 */}
            <div
              className={`rounded-2xl shadow-sm p-6 text-white overflow-hidden relative bg-gradient-to-br ${
                user?.isPremium ? 'from-[#7C3AED] to-[#A855F7]' : 'from-[#00A651] to-[#008f46]'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">멤버십 정보</h3>
                  {user?.isPremium ? (
                    <Crown className="w-6 h-6 text-yellow-300" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-[#DCFCE7]" />
                  )}
                </div>

                {user?.isPremium ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                        PREMIUM
                      </div>
                    </div>
                    <p className="text-white/90 text-sm mb-4">
                      모든 프리미엄 기능을 이용하고 계십니다
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
                        <span className="text-white/90">광고 없는 경험</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
                        <span className="text-white/90">AI 검색 무제한</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
                        <span className="text-white/90">프리미엄 배지</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-white/70">다음 결제일</p>
                      <p className="text-sm font-semibold">{formattedNextPaymentDate}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        FREE
                      </div>
                    </div>
                    <p className="text-white/90 text-sm mb-4">
                      무료 플랜을 이용하고 계십니다
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        <span className="text-white/70">AI 검색 3회 제한</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        <span className="text-white/70">광고 노출</span>
                      </div>
                    </div>
                    <button className="w-full bg-white text-[#00A651] font-bold py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg mt-2" onClick={onPaymentClick}>
                      프리미엄 구독하기
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 기본 정보 카드 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">기본 정보</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center transition-colors ${accentTextClass}`}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    수정
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${accentBgClass}`}
                    >
                      저장
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* 프로필 사진 */}
                <div className="flex items-center">
                  {cleanProfileImage !== '' && !imgError ? (
                    <img
                      src={cleanProfileImage}
                      alt="profile"
                      className="w-20 h-20 rounded-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className={`w-20 h-20 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-2xl font-bold ${profileGradientClass}`}>
                      {(editedUser.username || "?").charAt(0)}
                    </div>
                  )}
                  {isEditing && (
                    <label className={`ml-4 text-sm cursor-pointer ${accentTextClass}`}>
                      사진 변경
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 닉네임 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    닉네임
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accentFocusRingClass}`}
                    />
                  ) : (
                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editedUser.username}
                    </div>
                  )}
                </div>

                {/* 이메일 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    이메일
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.userId || 'user123'}
                  </div>
                </div>

                {/* 지역 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    활동 지역
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.address}
                      onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                      placeholder="예: 서울특별시"
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accentFocusRingClass}`}
                    />
                  ) : (
                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editedUser.address || <span className="text-gray-400">미입력</span>}
                    </div>
                  )}
                </div>

                {/* 나이와 성별 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 나이 */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      나이
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={editedUser.age}
                          onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                          placeholder="예: 25"
                          min="1"
                          max="150"
                          className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accentFocusRingClass}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          세
                        </span>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {editedUser.age ? `${editedUser.age}세` : <span className="text-gray-400">미입력</span>}
                      </div>
                    )}
                  </div>

                  {/* 성별 */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      성별
                    </label>
                    {isEditing ? (
                      <select
                        value={editedUser.gender}
                        onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white ${accentFocusRingClass}`}
                      >
                        <option value="">선택하세요</option>
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                        <option value="기타">기타</option>
                      </select>
                    ) : (
                      <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {editedUser.gender || <span className="text-gray-400">선택안함</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* 가입일 */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    가입일
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {editedUser.createdAt
                      ? new Date(editedUser.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : '미확인'}
                  </div>
                </div>
              </div>
            </div>

            {/* 활동 통계 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">활동 통계</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">참여 중인 모임</p>
                      <p className="text-2xl font-bold text-[#00A651] mt-1">{totalMyClub} 개</p>
                    </div>
                    <Users className={`w-8 h-8 opacity-20 ${accentStatClass}`} />
                  </div>
                </div>
                <div className="bg-[#FAF9F6] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">즐겨찾기</p>
                      <p className="text-2xl font-bold text-[#00A651] mt-1">{totalFavorite} 개</p>
                    </div>
                    <Heart className={`w-8 h-8 opacity-20 ${accentStatClass}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 빠른 링크 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 메뉴</h3>
              <div className="space-y-2">
                <button
                  onClick={onNavigateToGroupsManagement}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-[#FAF9F6] transition-colors text-gray-700 ${accentTextClass}`}
                >
                  내 모임 관리
                </button>
                <button
                  onClick={onNavigateToFavorites}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-[#FAF9F6] transition-colors text-gray-700 ${accentTextClass}`}
                >
                  즐겨찾기 목록
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">계정 관리</h3>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">회원 탈퇴</h2>
              <p className="text-gray-700 mb-2">회원 탈퇴하면 되돌릴 수 없습니다.</p>
              <p className="text-gray-700 mb-6">정말 탈퇴하시겠습니까?</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}