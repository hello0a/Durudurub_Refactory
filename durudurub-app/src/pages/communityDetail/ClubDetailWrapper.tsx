import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { CommunityDetailPage } from './CommunityDetailPage';
import { useApp } from '@/contexts/AppContext';

export default function ClubDetailWrapper() {

  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const { user, accessToken } = useApp();

  const [club, setClub] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const res = await fetch(`/api/clubs/${id}`, { headers });
        if (!res.ok) {
          navigate('/explore');
          return;
        }
        const data = await res.json();
        setClub(data);
      } catch (e) {
        console.error('모임 조회 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
      </div>
    );
  }

  if (!club?.club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">모임을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const c = club.club;

  // API 멤버 데이터를 CommunityDetailPage 형식으로 매핑
  const mappedMembers = (club.members || []).map((m: any) => ({
    id: m.userNo,
    name: m.user?.username || '멤버',
    role: m.userNo === c.hostNo ? 'leader' : 'member',
    joinedDate: m.joinedAt ? new Date(m.joinedAt).toISOString().slice(0, 10) : '',
    profileImg: m.user?.profileImg || '',
  }));

  // API 게시글 데이터를 CommunityDetailPage 형식으로 매핑
  const mappedBoards = (club.boards || []).map((b: any) => ({
    id: b.no,
    author: b.user?.username || '익명',
    content: b.content || '',
    date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('ko-KR') : '',
    likes: b.likeCount || 0,
    isLiked: b.liked || false,
    images: b.imageList?.map((img: any) => img.filePath) || [],
    comments: [],
    commentCount: b.commentCount || 0,
  }));

  // 모임 일정
  const schedules = c.clubDate
    ? [{ id: 1, date: new Date(c.clubDate).toISOString().slice(0, 10), time: new Date(c.clubDate).toTimeString().slice(0, 5) }]
    : [];

  return (
    <CommunityDetailPage
      id={c.no}
      image={c.thumbnailImg || ''}
      title={c.title || ''}
      description={c.description || ''}
      location={c.location || ''}
      hostName={c.host?.username || '호스트'}
      hostId={c.host?.userId}
      participants={{ current: mappedMembers.length || 0, max: c.maxMembers || 0 }}
      user={user}
      onBack={() => navigate(-1)}
      onLoginClick={() => navigate('/login')}
      initialMembers={mappedMembers}
      initialBoards={mappedBoards}
      initialSchedules={schedules}
      lat={c.lat || null}
      lng={c.lng || null}
      likeCount={c.likeCount || 0}
      isLiked={c.liked || false}
      initialMemberStatus={
        club.myMembership?.status === 'APPROVED' ? 'approved'
        : club.myMembership?.status === 'PENDING' ? 'pending'
        : 'none'
      }
    />
  );
}