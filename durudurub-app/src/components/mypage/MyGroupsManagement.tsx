import { ArrowLeft, Users, Crown, Clock, Trash2, UserCheck, UserX, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface MyGroupsManagementProps {
  onBack: () => void;
  user: any;
  profileImage?: string | null;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onNoticeClick?: () => void;
  onMyPageClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  onLogout?: () => void;
  onCommunityClick?: (communityId: number) => void;
}

interface Member {
  no: number
  clubNo: number
  userNo: number
  status: 'PENDING' | 'APPROVED'
  joinedAt: string
  user: {
    no: number
    username: string
    profileImg?: string
  }
}

interface Club {
  no: number
  title: string
  description?: string
  location?: string

  host: {
    no: number;
  } | null
  
  category: {
    no: number
    name: string
  } | null

  subCategory: {
    no: number
    name: string
  } | null

  currentMembers: number
  maxMembers: number

  thumbnailImg?: string
  clubDate?: string
}

interface Group {
  role: 'leader'
  club: Club
  pendingMembers: Member[]
  approvedMembers: Member[]
}

interface ConfirmModal {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'remove' | 'deleteGroup' | 'cancelRequest' | null;
  groupNo: number | null;
  memberId: number | null;
  memberName: string | null;
}

export function MyGroupsManagement({ onBack, user, profileImage, onSignupClick, onLoginClick, onLogoClick, onNoticeClick, onMyPageClick, onMiniGameClick, onMyMeetingsClick, onLogout, onCommunityClick }: MyGroupsManagementProps) {
  const [activeTab, setActiveTab] = useState<'joined' | 'leader' | 'pending'>('joined');
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    type: null,
    groupNo: null,
    memberId: null,
    memberName: null,
  });
  const [loading, setLoading] = useState(false);

  const [joinedGroups, setJoinedGroups] = useState<Club[]>([]);

  const [leaderGroups, setLeaderGroups] = useState<Group[]>([]);

  const [pendingGroups, setPendingGroups] = useState<Club[]>([]);

  const handleLeaveGroup = async (
    clubNo: number, groupName: string
  ) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/users/mypage/club/${clubNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("서버 에러:", text);
        throw new Error("탈퇴 실패");
      }

      console.log(res.status);
      
      // 상태에서 제거
      setJoinedGroups(prev =>
        prev.filter(club => club.no !== clubNo)
      );

    } catch (error) {
      console.error("탈퇴 실패:", error)
    }
  };

  const handleApproveMember = async (
    groupNo: number, memberId: number, memberName: string
  ) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/users/mypage/club/hostClub/${groupNo}/members/${memberId}/approved`, { 
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

       if (!res.ok) {throw new Error("승인 실패")};

       // 성공 시 목록 다시 로드
      loadLeaderGroups()

      const data = await res.json();
      console.log("approvedMemberData >>>>", data);
      setLeaderGroups(data || [])
    } catch (error) {
      console.error("멤버 승인 실패:", error)
    }
  };

  const handleRejectMember = async(
    groupNo: number, memberId: number, memberName: string
  ) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/users/mypage/club/hostClub/${groupNo}/members/${memberId}/reject`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

       if (!res.ok) {throw new Error("거부 실패")};

       // 성공 시 목록 다시 로드
      loadLeaderGroups()

      const data = await res.json();
      console.log("rejectMemberData >>>>", data);
      setLeaderGroups(data || [])
    } catch (error) {
      console.error("멤버 거부 실패:", error)
    }
  };

  const handleRemoveMember = (groupNo: number, memberId: number, memberName: string) => {
  setConfirmModal({
    isOpen: true,
    type: 'remove',
    groupNo,
    memberId,
    memberName,
  });
};

  const handleRemoveMemberApi = async (
  groupNo: number,
  memberId: number,
  memberName: string
) => {
  try {
    const token = sessionStorage.getItem('accessToken');

    const res = await fetch(
      `/api/users/mypage/club/hostClub/${groupNo}/members/${memberId}/remove`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) throw new Error("추방 실패");

    loadLeaderGroups();

  } catch (error) {
    console.error("추방 실패:", error);
  }
};

  const handleDeleteGroup = async (
    groupNo: number, groupName: string
  ) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/users/mypage/club/hostClub/${groupNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

       if (!res.ok) {throw new Error("모임 삭제 실패")};

       // 성공 시 목록 다시 로드
      loadLeaderGroups()

      const data = await res.json();
      console.log("rejectMemberData >>>>", data);
      setLeaderGroups(data || [])
    } catch (error) {
      console.error("모임 삭제 실패:", error)
    }
  };

  const handleCancelRequest = (groupNo: number, groupName: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'cancelRequest',
      groupNo: groupNo,
      memberId: null,
      memberName: groupName,
    });
  };

  const toggleGroupExpansion = (groupNo: number) => {
    setExpandedGroup(expandedGroup === groupNo ? null : groupNo);
  };

  useEffect(() => {
    loadJoinedGroups()
  },[]);

  const loadJoinedGroups = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/users/mypage/club/approvedClub', { headers });
      const data = await res.json();
      console.log("JoinedGroupsData .....", data);
      setJoinedGroups(data || [])
    } catch (error) {
      console.error('내모임(가입) 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderGroups();
  }, []);

  const loadLeaderGroups = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/users/mypage/club/hostClub', { headers });
      const data = await res.json();
      console.log("LeadersGroupsData .....", data);
      setLeaderGroups(data || [])
    } catch (error) {
      console.error('내모임(리더) 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingGroups();
  }, []);

  const loadPendingGroups = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/users/mypage/club/pendingClub', { headers });
      const data = await res.json();
      console.log("PendingGroupsdata .....", data);
      setPendingGroups(data || [])
    } catch (error) {
      console.error('내모임(승인) 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  const cancelPending = async (clubNo: number) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/users/mypage/club/pendingClub/${clubNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(`/api/users/mypage/club/pendingClub/${clubNo}`)
      console.log(">>>>>", res)

      if(!res.ok) throw new Error("신청 취소 실패");

      // ⭐ state에서 제거
      setPendingGroups(prev =>
        prev.filter(club => club.no !== clubNo)
      );

      console.log("setPendingGroups >>>", setPendingGroups)
    } catch (error) {
      console.error('내모임(승인) 삭제 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  const renderJoinedCard = (club: Club) => {
  const handleCardClick = () => {
    onCommunityClick?.(club.no);
  };

  

  return (
    <div key={club.no} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div
        className="flex items-start justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-xl transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00A651] to-[#008f46] rounded-lg flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{club.title}</h3>

            <p className="text-sm text-gray-600 mb-2">
              {club.category?.name}
            </p>

            <p className="text-sm text-gray-500">
              멤버 {club.currentMembers}/{club.maxMembers}명
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmModal({
              isOpen: true,
              type: 'remove',
              groupNo: club.no,
              memberId: null, // ⭐ 탈퇴는 null
              memberName: club.title
            });
          }}
          className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          탈퇴
        </button>
      </div>
    </div>
  );
};

  const renderGroupCard = (group: Group, showLeaveButton: boolean, showManagement: boolean) => {
    const isExpanded = expandedGroup === group.club.no;
    const pendingMembers = group.pendingMembers?.filter(m => m.status === 'PENDING') || [];
    const approvedMembers = group.approvedMembers?.filter(m => m.status === 'APPROVED') || [];

    console.log("pendingMember >>>> ", pendingMembers)
    console.log("approvedMembers >>>> ", approvedMembers)

    const handleCardClick = () => {
      console.log('카드 클릭됨:', group.club.no, group.club.title);
      if (onCommunityClick) {
        console.log('onCommunityClick 호출');
        onCommunityClick(group.club.no);
      } else {
        console.log('onCommunityClick이 정의되지 않음');
      }
    };

    return (
      <div key={group.club.no} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div 
          className="flex items-start justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-xl transition-colors"
          onClick={handleCardClick}
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00A651] to-[#008f46] rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{group.club.title}</h3>
                {group.role === 'leader' && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{group.club.category.name}</p>
              <p className="text-sm text-gray-500">
                멤버 {group.club.currentMembers}/{group.club.maxMembers}명
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {showLeaveButton && (
              <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmModal({
                  isOpen: true,
                  type: 'remove',
                  groupNo: group.club.no,
                  memberId: null, // ⭐ 탈퇴는 null
                  memberName: group.club.title
                });
              }}
                className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                탈퇴
              </button>
            )}
            {showManagement && (
              <>
                <button
                  onClick={() => toggleGroupExpansion(group.club.no)}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-[#00A651] hover:bg-[#00A651]/10 rounded-lg transition-colors"
                >
                  멤버 관리
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                   onClick={() => setConfirmModal({
                                    isOpen: true,
                                    type: 'deleteGroup',
                                    groupNo: group.club.no,
                                    memberId: null,
                                    memberName: group.club.title
                                  })}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  모임 삭제
                </button>
              </>
            )}
          </div>
        </div>

        {/* 리더 전용: 멤버 관리 섹션 */}
        {showManagement && isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* 가입 요청 대기 중인 멤버 */}
            {pendingMembers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  가입 요청 ({pendingMembers.length})
                </h4>
                <div className="space-y-2">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.user.no}
                      className="flex items-center justify-between bg-orange-50 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{member.user.username}</p>
                        <p className="text-xs text-gray-500">신청일: {member.joinedAt.slice(0, 10)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmModal({
                                            isOpen: true,
                                            type: 'approve',
                                            groupNo: group.club.no,
                                            memberId: member.user.no,
                                            memberName: member.user.username
                                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#00A651] text-white text-sm rounded-lg hover:bg-[#008f46] transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          승인
                        </button>
                        <button
                          onClick={() => setConfirmModal({
                                            isOpen: true,
                                            type: 'reject',
                                            groupNo: group.club.no,
                                            memberId: member.user.no,
                                            memberName: member.user.username
                                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          거부
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 승인된 멤버 목록 */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">
                승인된 멤버 ({approvedMembers.length})
              </h4>
              <div className="space-y-2">
                {approvedMembers.map((member) => (
                  <div
                    key={member.user.no}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{member.user.username}</p>
                      <p className="text-xs text-gray-500">가입일: {member.joinedAt.slice(0, 10)}</p>
                    </div>
                    {member.user.no !== group.club.host.no && ( 
                      <button
                        onClick={() => handleRemoveMember(group.club.no, member.user.no, member.user.username)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        추방하기
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Toaster position="top-center" richColors />
      {/* 모바일 뒤로가기 버튼 */}
      <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center justify-center text-gray-700 hover:text-[#00A651] transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex-1 px-3 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'joined'
                ? 'bg-[#00A651] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">참여 중인 모임</span>
              <span className="inline sm:hidden text-xs">참여중</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'joined' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {joinedGroups.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leader')}
            className={`flex-1 px-3 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'leader'
                ? 'bg-[#00A651] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">리더인 모임</span>
              <span className="inline sm:hidden text-xs">리더</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'leader' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {leaderGroups.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-3 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-[#00A651] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">승인 대기 중</span>
              <span className="inline sm:hidden text-xs">대기중</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {pendingGroups.length}
              </span>
            </div>
          </button>
        </div>

        {/* 모임 목록 */}
        <div className="space-y-4">
          {activeTab === 'joined' && (
            <>
              {joinedGroups.length > 0 ? (
                joinedGroups.map((club) => renderJoinedCard(club))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">참여 중인 모임이 없습니다</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'leader' && (
            <>
              {leaderGroups.length > 0 ? (
                leaderGroups.map((group) => renderGroupCard(group, false, true))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">리더로 활동 중인 모임이 없습니다</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'pending' && (
            <>
              {pendingGroups.length > 0 ? (
                pendingGroups.map((club) => (
                  <div key={club.no} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{club.title}</h3>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                              승인 대기 중
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{club.category.name}</p>
                          <p className="text-sm text-gray-500">
                            멤버 {club.currentMembers}/{club.maxMembers}명
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(club.no, club.title)}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        신청 취소
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">가입 신청 중인 모임이 없습니다</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 확인 모달 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {confirmModal.type === 'approve' && '멤버 승인'}
                {confirmModal.type === 'reject' && '가입 거부'}
                {confirmModal.type === 'remove' && (confirmModal.memberId === null ? '모임 탈퇴' : '멤버 내보내기')}
                {confirmModal.type === 'deleteGroup' && '모임 삭제'}
                {confirmModal.type === 'cancelRequest' && '가입 신청 취소'}
              </h3>
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, groupNo: null, memberId: null, memberName: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              {confirmModal.type === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold text-gray-900">{confirmModal.memberName}</span>님의 가입을 승인하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-600">
                    승인하면 멤버가 모임에 참여하여 게시글 작성 및 활동이 가능합니다.
                  </p>
                </div>
              )}
              
              {confirmModal.type === 'reject' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold text-gray-900">{confirmModal.memberName}</span>님의 가입을 거부하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-600">
                    거부하면 해당 사용자는 모임에 참여할 수 없습니다.
                  </p>
                </div>
              )}
              
              {confirmModal.type === 'remove' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  {confirmModal.memberId === null ? (
                    // 모임 탈퇴인 경우
                    <>
                      <p className="text-gray-700 mb-2">
                        모임에서 탈퇴 하시겠습니까?
                      </p>
                      <p className="text-sm text-gray-600">
                        탈퇴하면 더 이상 모임 활동을 할 수 없습니다.
                      </p>
                    </>
                  ) : (
                    // 멤버 내보내기인 경우
                    <>
                      <p className="text-gray-700 mb-2">
                        <span className="font-semibold text-gray-900">{confirmModal.memberName}</span>님을 모임에서 내보내시겠습니까?
                      </p>
                      <p className="text-sm text-gray-600">
                        내보내면 해당 멤버는 더 이상 모임 활동을 할 수 없습니다.
                      </p>
                    </>
                  )}
                </div>
              )}
              
              {confirmModal.type === 'deleteGroup' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold text-gray-900">{confirmModal.memberName}</span> 모임을 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-600">
                    삭제하면 해당 모임은 영구적으로 삭제됩니다.
                  </p>
                </div>
              )}
              
              {confirmModal.type === 'cancelRequest' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold text-gray-900">{confirmModal.memberName}</span> 모임의 가입 신청을 취소하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-600">
                    취소하면 해당 모임의 가입 신청이 삭제됩니다.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, groupNo: null, memberId: null, memberName: null })}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    if (confirmModal.type === 'approve') {
                      await handleApproveMember(
                        confirmModal.groupNo!,
                        confirmModal.memberId!,
                        confirmModal.memberName!
                      );
                      toast.success('멤버 승인이 완료되었습니다.');

                    } else if (confirmModal.type === 'reject') {
                      await handleRejectMember(
                        confirmModal.groupNo!,
                        confirmModal.memberId!,
                        confirmModal.memberName!
                      );
                      toast.error('가입 신청이 거부되었습니다.');

                    } else if (confirmModal.type === 'remove') {

                      if (confirmModal.memberId === null) {
                        await handleLeaveGroup(
                          confirmModal.groupNo!,
                          confirmModal.memberName!
                        );
                        toast.success('모임에서 탈퇴했습니다.');
                      } else {
                        await handleRemoveMemberApi(
                          confirmModal.groupNo!,
                          confirmModal.memberId!,
                          confirmModal.memberName!
                        );
                        console.log("추방 API 필요");
                        toast.success('멤버를 내보냈습니다.');
                      }

                    } else if (confirmModal.type === 'deleteGroup') {
                      await handleDeleteGroup(
                        confirmModal.groupNo!,
                        confirmModal.memberName!
                      );
                      toast.success('모임이 삭제되었습니다.');

                    } else if (confirmModal.type === 'cancelRequest') {
                      await cancelPending(confirmModal.groupNo!);
                      toast.success('가입 신청이 취소되었습니다.');
                    }

                  } catch (error) {
                    console.error(error);
                    toast.error('작업 실패');
                  }

                  setConfirmModal({
                    isOpen: false,
                    type: null,
                    groupNo: null,
                    memberId: null,
                    memberName: null
                  });
                }}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                  confirmModal.type === 'approve'
                    ? 'bg-[#00A651] hover:bg-[#008f46]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.type === 'approve' 
                  ? '승인하기' 
                  : confirmModal.type === 'reject' 
                  ? '거부하기'
                  : confirmModal.type === 'deleteGroup'
                  ? '삭제하기'
                  : confirmModal.type === 'cancelRequest'
                  ? '취소하기'
                  : confirmModal.memberId === null 
                  ? '탈퇴하기' 
                  : '내보내기'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}