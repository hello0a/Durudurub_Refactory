import { MapPin, Calendar, Clock, Users, Star, ArrowLeft, MessageSquare, Lock, ThumbsUp, CheckCircle, Clock as ClockIcon, X, Image as ImageIcon, Send, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/api/axios';
import L from 'leaflet';
import { BannerData } from '@/pages/admin/AdminPage';
import 'leaflet/dist/leaflet.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'sonner';
import { EditCommunityModal } from '../communityEdit/EditCommunityModal';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// 커스텀 마커 아이콘 생성
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        background-color: #00A651;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

interface CommunityDetailPageProps {
  id: number;
  image: string;
  title: string;
  description: string;
  location: string;
  hostName: string;
  hostId?: string; // 리더 확인을 위한 hostId 추가
  participants: { current: number; max: number };
  user: any;
  onBack: () => void;
  onLoginClick: () => void;
  initialMembers?: { id: number; name: string; role: string; joinedDate: string; profileImg?: string }[];
  initialBoards?: Post[];
  initialSchedules?: MeetingSchedule[];
  lat?: number | null;
  lng?: number | null;
  likeCount?: number;
  isLiked?: boolean;
  initialMemberStatus?: 'none' | 'pending' | 'approved';
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
  isLiked: boolean;
  images?: string[];
  comments: Comment[];
  commentCount?: number;
}

interface MeetingSchedule {
  id: number;
  date: string; // "2026-02-15"
  time: string; // "14:00"
}

export function CommunityDetailPage({
  id,
  image,
  title,
  description,
  location,
  hostName,
  hostId,
  participants,
  user,
  onBack,
  onLoginClick,
  initialMembers,
  initialBoards,
  initialSchedules,
  lat: propLat,
  lng: propLng,
  likeCount: propLikeCount,
  isLiked: propIsLiked,
  initialMemberStatus,
}: CommunityDetailPageProps) {
  const [isLiked, setIsLiked] = useState(propIsLiked || false);
  const [favoriteCount, setFavoriteCount] = useState(propLikeCount || 0);
  const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [showMemberOnlyModal, setShowMemberOnlyModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTimer, setAdTimer] = useState(3);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState<string>('');
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportedUsers, setReportedUsers] = useState<Set<string>>(new Set());
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [members, setMembers] = useState(
    initialMembers && initialMembers.length > 0
      ? initialMembers
      : [{ id: 0, name: hostName, role: 'leader', joinedDate: '' }]
  );
  const [posts, setPosts] = useState<Post[]>(initialBoards || []);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const [adShown, setAdShown] = useState(false); // 광고가 이미 표시되었는지 추적
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  
  // 리더 확인 로직: 현재 로그인한 사용자의 userId와 모임 hostId 비교
  const isLeader = user && hostId && user.userId === hostId;
  
  // 모임 정보 수정 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedLocation, setEditedLocation] = useState(location);
  const [editedMaxParticipants, setEditedMaxParticipants] = useState(participants?.max || 0);
  const [editedSchedules, setEditedSchedules] = useState<MeetingSchedule[]>(initialSchedules || []);
  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newSchedulePeriod, setNewSchedulePeriod] = useState<'오전' | '오후'>('오전');
  const [newScheduleHour, setNewScheduleHour] = useState('');
  const [newScheduleMinute, setNewScheduleMinute] = useState('00');

  // 게시물/댓글 삭제 모달 state
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ postId: number; commentId: number } | null>(null);

  // 멤버 추방 모달 state
  const [showKickMemberModal, setShowKickMemberModal] = useState(false);
  const [memberToKick, setMemberToKick] = useState<{ id: number; name: string } | null>(null);

  // 광고 모달
  const [popupBanner, setPopupBanner] = useState<BannerData | null>(null);
  const [banners, setBanners] = useState<BannerData[]>([]);
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        setBanners(
          data.map((b: any) => ({
            ...b,
            isActive: b.isActive === 'Y'
          }))
        );
      } catch (error) {
        console.error('배너 불러오기 실패', error);
      }
    };
    
    loadBanners();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    
    const popupBanners = banners.filter(
      b => b.position === 'POPUP' && b.isActive
    );

    if (popupBanners.length === 0) return;

    const randomIndex = Math.floor(Math.random() * popupBanners.length);
    setPopupBanner(popupBanners[randomIndex]);
  }, [banners]);

  // 지나간 일정 자동 삭제
  useEffect(() => {
    const now = new Date();
    const futureSchedules = editedSchedules.filter(schedule => {
      const scheduleDate = new Date(`${schedule.date}T${schedule.time}`);
      return scheduleDate >= now;
    });
    
    if (futureSchedules.length !== editedSchedules.length) {
      setEditedSchedules(futureSchedules);
    }
  }, [editedSchedules]);

  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const mapLat = propLat || 37.5665;
    const mapLng = propLng || 126.9780;

    const map = L.map(mapRef.current).setView([mapLat, mapLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([mapLat, mapLng], { icon: customIcon }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [propLat, propLng]);

  // 게시글 섹션에 도달했을 때 광고 표시
  useEffect(() => {
    // ⭐ 1. 조건 체크
    const isAdmin = user?.isAdmin || user?.userId === 'admin';
    const isPremium = user?.isPremium === true;

    if (isAdmin || isPremium) return;

    // ⭐ 2. DOM 렌더 보장 (핵심)
    const timer = setTimeout(() => {
      if (!postsRef.current) {
        console.log("❌ postsRef 없음");
        return;
      }

      console.log("✅ observer 연결됨");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            console.log("intersection:", entry.isIntersecting);

            if (entry.isIntersecting && !adShown) {
              console.log("🔥 광고 실행");
              setShowAdModal(true);
              setAdShown(true);
            }
          });
        },
        {
          threshold: 0.1, // ⭐ 유지
        }
      );

      observer.observe(postsRef.current);

      // cleanup
      return () => {
        observer.disconnect();
      };
    }, 100); // ⭐ 핵심 포인트

    return () => clearTimeout(timer);

  }, [adShown, user]);

  // 컴포넌트 마운트 시 멤버십 상태 조회
  useEffect(() => {
    if (!user) {
      setMemberStatus('none');
      return;
    }
    if (initialMemberStatus) {
      setMemberStatus(initialMemberStatus);
    } else {
      setMemberStatus('none');
    }
  }, [user, initialMemberStatus]);

  // 즉겨찾기 상태 - 백엔드 API 사용
  useEffect(() => {
    if (!user) return;
    const fetchLikeStatus = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/likes/club/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked || false);
        }
      } catch {
        // 실패 시 기본값 유지
      }
    };
    fetchLikeStatus();
  }, [user, id]);

  // 즐겨찾기 수는 props에서 받은 likeCount로 초기화됨

  const handleJoinGroup = async () => {
    if (!user) {
      setShowLoginRequiredModal(true);
      return;
    }
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/clubs/${id}/join`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        setMemberStatus('pending');
        toast.success('가입 신청이 완료되었습니다.');
      } else {
        const errorText = await res.text();
        toast.error(errorText || '가입 신청에 실패했습니다.');
      }
    } catch {
      toast.error('가입 신청 중 오류가 발생했습니다.');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const imageUrls: string[] = [];

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === fileArray.length) {
          setSelectedImages([...selectedImages, ...imageUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async () => {
    if ((newPost.trim() || selectedImages.length > 0) && user) {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(`/api/clubs/${id}/boards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content: newPost }),
        });
        if (!res.ok) throw new Error('게시글 작성 실패');
        const saved = await res.json();
        const post: Post = {
          id: saved.no,
          author: user.nickname || user.email?.split('@')[0] || '익명',
          content: saved.content || newPost,
          date: '방금 전',
          likes: 0,
          isLiked: false,
          images: selectedImages.length > 0 ? [...selectedImages] : undefined,
          comments: [],
        };
        setPosts([post, ...posts]);
        setNewPost('');
        setSelectedImages([]);
        toast.success('게시글이 등록되었습니다');
      } catch (e) {
        console.error('게시글 작성 오류:', e);
        toast.error('게시글 작성에 실패했습니다');
      }
    }
  };

  const handleLikePost = async (postId: number) => {
    if (memberStatus !== 'approved') {
      setShowMemberOnlyModal(true);
      return;
    }
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/likes/board/${postId}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('좋아요 처리 실패');
      const data = await res.json();
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          likes: data.count,
          isLiked: data.liked,
        } : post
      ));
    } catch (e) {
      console.error('좋아요 오류:', e);
    }
  };

  const handleReportClick = (targetUser: string) => {
    // 미로그인 유저 체크
    if (!user) {
      toast.error('로그인 후 이용 가능합니다');
      return;
    }
    // 관리자 체크
    if (user.isAdmin || user.userId === 'admin') {
      toast.error('관리자는 신고할 수 없습니다');
      return;
    }
    // 본인 신고 방지
    const currentUserNickname = user.nickname || user.email?.split('@')[0] || '익명';
    if (targetUser === currentUserNickname) {
      toast.error('자신을 신고할 수 없습니다');
      return;
    }
    // 중복 신고 방지
    if (reportedUsers.has(targetUser)) {
      toast.error('이미 신고한 사용자입니다');
      return;
    }
    setReportTargetUser(targetUser);
    setShowReportModal(true);
  };

  const handleCommentSubmit = async (postId: number) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || !user) return;

    if (memberStatus !== 'approved') {
      setShowMemberOnlyModal(true);
      return;
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ boardNo: postId, content: commentText }),
      });
      if (!res.ok) throw new Error('댓글 작성 실패');

      // 댓글 목록 다시 조회
      const commentsRes = await fetch(`/api/comments/board/${postId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const commentsData = commentsRes.ok ? await commentsRes.json() : [];

      const mappedComments = commentsData.map((c: any) => ({
        id: c.no,
        author: c.writer?.username || '익명',
        content: c.content,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '방금 전',
      }));

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: mappedComments, commentCount: mappedComments.length }
          : post
      ));

      setCommentInputs({ ...commentInputs, [postId]: '' });
      toast.success('댓글이 등록되었습니다');
    } catch (e) {
      console.error('댓글 작성 오류:', e);
      toast.error('댓글 작성에 실패했습니다');
    }
  };

  const toggleComments = async (postId: number) => {
    const isOpening = !showComments[postId];
    setShowComments({ ...showComments, [postId]: isOpening });

    if (isOpening) {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(`/api/comments/board/${postId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const commentsData = await res.json();
          const mappedComments = commentsData.map((c: any) => ({
            id: c.no,
            author: c.writer?.username || '익명',
            content: c.content,
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '',
          }));
          setPosts(prev => prev.map(post =>
            post.id === postId ? { ...post, comments: mappedComments, commentCount: mappedComments.length } : post
          ));
        }
      } catch (e) {
        console.error('댓글 로딩 오류:', e);
      }
    }
  };

  // 게시물 삭제 함수
  const handleDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    if (postToDelete !== null) {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(`/api/clubs/${id}/boards/${postToDelete}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('삭제 실패');
        setPosts(posts.filter(post => post.id !== postToDelete));
        toast.success('게시물이 삭제되었습니다');
      } catch (e) {
        console.error('게시글 삭제 오류:', e);
        toast.error('게시물 삭제에 실패했습니다');
      }
      setShowDeletePostModal(false);
      setPostToDelete(null);
    }
  };

  // 댓글 삭제 함수
  const handleDeleteComment = (postId: number, commentId: number) => {
    setCommentToDelete({ postId, commentId });
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (commentToDelete) {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(`/api/comments/${commentToDelete.commentId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('삭제 실패');
        setPosts(posts.map(post => {
          if (post.id === commentToDelete.postId) {
            const filtered = post.comments.filter(comment => comment.id !== commentToDelete.commentId);
            return { ...post, comments: filtered, commentCount: filtered.length };
          }
          return post;
        }));
        toast.success('댓글이 삭제되었습니다');
      } catch (e) {
        console.error('댓글 삭제 오류:', e);
        toast.error('댓글 삭제에 실패했습니다');
      }
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  // 멤버 추방 함수
  const handleKickMember = (memberId: number, memberName: string) => {
    setMemberToKick({ id: memberId, name: memberName });
    setShowKickMemberModal(true);
  };

  const confirmKickMember = () => {
    if (memberToKick) {
      setMembers(members.filter(member => member.id !== memberToKick.id));
      toast.success(`${memberToKick.name}님을 추방했습니다`);
      setShowKickMemberModal(false);
      setMemberToKick(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/likes/club/${id}`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setFavoriteCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch {
      // 실패 시 프론트엔드에서 토글
      setIsLiked(!isLiked);
      setFavoriteCount(isLiked ? favoriteCount - 1 : favoriteCount + 1);
    }
  };

  const handleEditInfoSave = async (data: {
    title: string;
    description: string;
    location: string;
    maxParticipants: number;
    schedules: MeetingSchedule[];
  }) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('maxMembers', String(data.maxParticipants));

      await api.put(`/api/clubs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEditedTitle(data.title);
      setEditedDescription(data.description);
      setEditedLocation(data.location);
      setEditedMaxParticipants(data.maxParticipants);
      setEditedSchedules(data.schedules);
      toast.success('모임 정보가 수정되었습니다!');
    } catch (error) {
      console.error('모임 수정 실패:', error);
      toast.error('모임 수정에 실패했습니다.');
    }
  };

  const formatScheduleDisplay = (schedule: MeetingSchedule) => {
    const date = new Date(`${schedule.date}T${schedule.time}`);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 || hours === 12 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${month}월 ${day}일 (${weekday}) ${period} ${displayHours}:${displayMinutes}`;
  };

  useEffect(() => {
    if (showAdModal) {
      const timer = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showAdModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 이미지 */}
      <div className="relative h-[400px] bg-gray-900">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* 모바일 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="md:hidden absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        {/* 뒤로가기 버튼 (데스크톱) */}
        <button
          onClick={onBack}
          className="hidden md:flex items-center justify-center w-12 h-12 bg-[#00A651] text-white rounded-full shadow-lg hover:bg-[#008E41] transition-all duration-200 hover:shadow-xl mb-4"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 카드 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 헤더 정보 */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex-1">{editedTitle}</h1>
              
              <div className="flex items-center gap-3 ml-4">
                {/* 즐겨찾기 버튼 */}
                <button
                  onClick={handleToggleFavorite}
                  className={`rounded-full p-3 transition-all shadow-md relative ${
                    isLiked 
                      ? 'bg-yellow-50 hover:bg-yellow-100' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 ${isLiked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                  />
                  {favoriteCount > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-[#00A651] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {favoriteCount}
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            {/* 호스트 정보 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#00A651] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {hostName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">리더</p>
                <p className="font-semibold text-gray-900">{hostName}</p>
              </div>
            </div>

            {/* 하단 영역: 참가 인원(좌측) + 가입 버튼(중앙) + 정보 수정 버튼(우측) */}
            <div className="flex items-center justify-between gap-3">
              {/* 참가 인원 - 좌측 고정 */}
              <button
                onClick={() => setShowMemberListModal(true)}
                className="inline-flex items-center gap-2 bg-[#00A651]/10 px-4 py-2 rounded-full hover:bg-[#00A651]/20 transition-colors cursor-pointer"
              >
                <Users className="w-5 h-5 text-[#00A651]" />
                <span className="font-semibold text-[#00A651]">
                  {participants.current}/{participants.max}명 참여 중
                </span>
              </button>

              {/* 가운데 영역: 모임 가입하기 버튼 */}
              {memberStatus !== 'approved' && (
                <button
                  onClick={handleJoinGroup}
                  disabled={memberStatus === 'pending'}
                  className={`font-bold py-2 px-6 rounded-full shadow-md transition-colors ${
                    memberStatus === 'pending'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#00A651] text-white hover:bg-[#008E41]'
                  }`}
                >
                  {memberStatus === 'pending' ? '신청 대기중' : '모임 가입하기'}
                </button>
              )}
              
              {/* 정보 수정 버튼 - 우측 고정 (리더만 표시) */}
              {isLeader && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00A651] text-white rounded-full hover:bg-[#008E41] transition-colors font-medium text-sm ml-auto"
                >
                  <Edit className="w-4 h-4" />
                  정보 수정
                </button>
              )}
            </div>
          </div>

          {/* 모임 정보 */}
          <div className="p-8 space-y-6">
            {/* 모임 소개 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">모임 소개</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{editedDescription}</p>
              <p className="text-gray-700 leading-relaxed">
                새로운 사람들과 함께 즐거운 시간을 보내고 싶다면 지금 바로 참여해보세요! 
                초보자도 환영하며, 편안한 분위기에서 함께 활동합니다.
              </p>
            </div>

            {/* 일정 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              {/* 모임 일정 목록 */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">다가오는 모임 일정</h2>
                  {isLeader && editedSchedules.length < 5 && (
                    <button
                      onClick={() => {
                        // 모달 열 때 현재 날짜를 기본값으로 설정
                        const today = new Date().toISOString().split('T')[0];
                        setNewScheduleDate(today);
                        setNewScheduleTime('');
                        setShowAddScheduleModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00A651] text-white rounded-full hover:bg-[#008E41] transition-colors font-medium text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      일정 추가
                    </button>
                  )}
                </div>
                {editedSchedules.length > 0 ? (
                  editedSchedules
                    .sort((a, b) => {
                      // 날짜 문자열을 Date 객체로 변환하여 비교
                      const dateTimeA = new Date(`${a.date}T${a.time}`);
                      const dateTimeB = new Date(`${b.date}T${b.time}`);
                      return dateTimeA.getTime() - dateTimeB.getTime(); // 오름차순 정렬 (가까운 날짜가 먼저)
                    })
                    .map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between gap-4 p-4 bg-[#00A651]/5 border-l-4 border-[#00A651] rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 text-[#00A651]">
                          <ClockIcon className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-gray-900">{formatScheduleDisplay(schedule)}</p>
                      </div>
                      {isLeader && (
                        <button
                          onClick={() => {
                            setScheduleToDelete(schedule.id);
                            setShowDeleteScheduleModal(true);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="일정 삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">등록된 모임 일정이 없습니다.</p>
                )}
              </div>

              {/* 장소 */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#00A651]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">장소</p>
                  <p className="font-semibold text-gray-900 mb-3">{editedLocation}</p>
                  {/* 지도 */}
                  <div ref={mapRef} style={{ height: '250px', borderRadius: '0.75rem' }} className="border border-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 섹션 */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">게시글</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>멤버만 작성 가능</span>
            </div>
          </div>

          {/* 가입 유도 배너 */}
          {user && memberStatus === 'none' && (
            <div className="bg-gradient-to-r from-[#00A651] to-[#008E41] rounded-2xl shadow-lg p-6 mb-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">이 모임의 멤버가 되어보세요!</h3>
                  <p className="text-white/90 text-sm">멤버가 되면 게시글을 작성하고 모임 활동에 참여할 수 있습니다.</p>
                </div>
                <button
                  onClick={handleJoinGroup}
                  className="bg-white text-[#00A651] font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap ml-4"
                >
                  가입하기
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* 게시글 작성 영역 - 멤버만 표시 */}
            {user && memberStatus === 'approved' && (
              <div className={`p-6 border-b border-gray-100 transition-all ${showAdModal ? 'blur-sm' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {(user.nickname || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="게시글을 작성해보세요..."
                      className="w-full h-24 bg-gray-50 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900 mb-3"
                    />
                    
                    {/* 선택된 이미지 미리보기 */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {selectedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`preview-${index}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#00A651] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm">사진 추가</span>
                      </button>
                      <button
                        onClick={handlePostSubmit}
                        disabled={!newPost.trim() && selectedImages.length === 0}
                        className="ml-auto bg-[#00A651] text-white font-semibold py-2 px-5 rounded-full hover:bg-[#008E41] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        작성하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 게시글 목록 */}
            <div className={`divide-y divide-gray-100 transition-all ${showAdModal ? 'blur-sm' : ''}`} ref={postsRef}>
              {posts.map(post => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {post.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p 
                            className="font-semibold text-gray-900 cursor-pointer hover:text-[#00A651] transition-colors"
                            onClick={() => handleReportClick(post.author)}
                          >
                            {post.author}
                          </p>
                          <span className="text-sm text-gray-400">·</span>
                          <p className="text-sm text-gray-500">{post.date}</p>
                        </div>
                        {/* 작성자 본인이거나 리더일 때 삭제 버튼 표시 */}
                        {user && (post.author === (user.nickname || user.email?.split('@')[0]) || isLeader) && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="게시물 삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">{post.content}</p>
                      
                      {/* 게시글 이미지 */}
                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-3 ${
                          post.images.length === 1 ? 'grid-cols-1' : 
                          post.images.length === 2 ? 'grid-cols-2' : 
                          'grid-cols-3'
                        }`}>
                          {post.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`post-image-${index}`}
                              className={`w-full ${post.images!.length === 1 ? 'h-80' : 'h-40'} object-cover rounded-lg`}
                            />
                          ))}
                        </div>
                      )}

                      {/* 좋아요 & 댓글 버튼 */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <ThumbsUp
                            className={`w-5 h-5 ${post.isLiked ? 'fill-[#00A651] text-[#00A651]' : 'text-gray-500'}`}
                          />
                          <span className={`text-sm font-medium ${post.isLiked ? 'text-[#00A651]' : 'text-gray-500'}`}>
                            {post.likes}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500">
                            {post.commentCount ?? post.comments.length}
                          </span>
                        </button>
                      </div>

                      {/* 댓글 섹션 */}
                      {showComments[post.id] && (
                        <div className="mt-4 space-y-3">
                          {/* 댓글 목록 */}
                          {post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                              <div className="w-8 h-8 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {comment.author.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleReportClick(comment.author)}
                                      className="text-sm font-semibold text-gray-900 hover:text-[#00A651] transition-colors cursor-pointer"
                                    >
                                      {comment.author}
                                    </button>
                                    <span className="text-xs text-gray-400">·</span>
                                    <p className="text-xs text-gray-500">{comment.date}</p>
                                  </div>
                                  {/* 작성자 본인이거나 리더일 때 삭제 버튼 표시 */}
                                  {user && (comment.author === (user.nickname || user.email?.split('@')[0]) || isLeader) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                      aria-label="댓글 삭제"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* 댓글 입력 */}
                          {user && memberStatus === 'approved' && (
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                placeholder="댓글을 입력하세요..."
                                className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCommentSubmit(post.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                                className="bg-[#00A651] text-white p-2 rounded-full hover:bg-[#008E41] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 멤버 전용 알림 모달 */}
      {showMemberOnlyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowMemberOnlyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">멤버만 이용할 수 있습니다</h3>
            <p className="text-gray-600 mb-6">모임에 가입하시면 게시글에 좋아요를 남기고 댓글을 작성할 수 있어요.</p>
            <button
              onClick={() => setShowMemberOnlyModal(false)}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 가입 성공 알림 모달 */}
      {showJoinSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowJoinSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">가입 신청이 완료되었습니다!</h3>
            <p className="text-gray-600 mb-6">리더가 승인하면 모임 활동에 참여할 수 있어요.</p>
            <button
              onClick={() => setShowJoinSuccessModal(false)}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 로그인 필요 알림 모달 */}
      {showLoginRequiredModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowLoginRequiredModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-6">모임에 가입하시려면 로그인해주세요.</p>
            <button
              onClick={() => {
                setShowLoginRequiredModal(false);
                onLoginClick();
              }}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}

      {/* 로그인 필요 알림 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-6">즐겨찾기를 사용하려면 로그인해주세요.</p>
            <button
              onClick={() => {
                setShowLoginModal(false);
                onLoginClick();
              }}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}

      {/* 광고 모달 */}
      {showAdModal && popupBanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
            {/* X 버튼 - 15초 후 활성화 */}
            <button
              onClick={() => adTimer <= 0 && setShowAdModal(false)}
              disabled={adTimer > 0}
              className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                adTimer > 0 
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              aria-label="닫기"
            >
              {adTimer > 0 ? (
                <span className="text-sm font-bold">{adTimer}</span>
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>

            {/* 광고 이미지 */}
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-cyan-500">
              <ImageWithFallback
                src={popupBanner?.imageUrl}
                alt={popupBanner?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                    SPONSORED AD
                  </div>
                  <h3 className="text-white text-2xl font-bold">{popupBanner?.title}</h3>
                </div>
              </div>
            </div>

            {/* 광고 내용 */}
            <div className="p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-3">몰입감 넘치는 사운드 경험</h4>
              <p className="text-gray-600 mb-6">
                {popupBanner?.description}
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-gray-400 line-through text-lg">₩299,000</span>
                <span className="text-3xl font-bold text-blue-600">₩199,000</span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">33% OFF</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                onClick={() => {
                  setShowAdModal(false);

                  if (popupBanner?.linkUrl) {
                    window.location.href = popupBanner.linkUrl;
                  }
                }}
              >
                자세히 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모임 정보 수정 모달 */}
      {showEditModal && (
        <EditCommunityModal
          title={editedTitle}
          description={editedDescription}
          location={editedLocation}
          maxParticipants={editedMaxParticipants}
          schedules={editedSchedules}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditInfoSave}
        />
      )}

      {/* 일정 삭제 확인 모달 */}
      {showDeleteScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => {
                setShowDeleteScheduleModal(false);
                setScheduleToDelete(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">일정을 삭제하시겠습니까?</h3>
            <p className="text-gray-600 mb-6">삭제한 일정은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteScheduleModal(false);
                  setScheduleToDelete(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (scheduleToDelete !== null) {
                    setEditedSchedules(editedSchedules.filter(s => s.id !== scheduleToDelete));
                  }
                  setShowDeleteScheduleModal(false);
                  setScheduleToDelete(null);
                }}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 게시물 삭제 확인 모달 */}
      {showDeletePostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => {
                setShowDeletePostModal(false);
                setPostToDelete(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">게시물을 삭제하시겠습니까?</h3>
            <p className="text-gray-600 mb-6">삭제한 게시물은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeletePostModal(false);
                  setPostToDelete(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDeletePost}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 확인 모달 */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => {
                setShowDeleteCommentModal(false);
                setCommentToDelete(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">댓글을 삭제하시겠습니까?</h3>
            <p className="text-gray-600 mb-6">삭제한 댓글은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDelete(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteComment}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
            <button
              onClick={() => {
                setShowAddScheduleModal(false);
                setNewScheduleDate('');
                setNewScheduleTime('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">일정 추가</h3>
            <p className="text-gray-600 mb-6 text-center">새로운 모임 일정을 추가해주세요.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
                <div className="flex justify-center">
                  <DatePicker
                    selected={newScheduleDate ? new Date(newScheduleDate) : new Date()}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setNewScheduleDate(`${year}-${month}-${day}`);
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy년 MM월 dd일"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                    calendarClassName="custom-calendar"
                    inline
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">시간</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newSchedulePeriod}
                    onChange={(e) => setNewSchedulePeriod(e.target.value as '오전' | '오후')}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                  >
                    <option value="오전">오전</option>
                    <option value="오후">오후</option>
                  </select>
                  <input
                    type="number"
                    value={newScheduleHour}
                    onChange={(e) => setNewScheduleHour(e.target.value)}
                    min="1"
                    max="12"
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                  />
                  <span className="text-gray-500">시</span>
                  <input
                    type="number"
                    value={newScheduleMinute}
                    onChange={(e) => setNewScheduleMinute(e.target.value)}
                    min="0"
                    max="59"
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                  />
                  <span className="text-gray-500">분</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddScheduleModal(false);
                  setNewScheduleDate('');
                  setNewScheduleTime('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newScheduleDate && newScheduleHour && newScheduleMinute !== '') {
                    // 시간 변환
                    let hour24 = parseInt(newScheduleHour);
                    if (newSchedulePeriod === '오후' && hour24 < 12) {
                      hour24 += 12;
                    } else if (newSchedulePeriod === '오전' && hour24 === 12) {
                      hour24 = 0;
                    }
                    
                    const timeString = `${String(hour24).padStart(2, '0')}:${String(newScheduleMinute).padStart(2, '0')}`;
                    
                    // 당일 모임인 경우 현재 시간보다 이후인지 확인
                    const now = new Date();
                    const selectedDateTime = new Date(`${newScheduleDate}T${timeString}`);
                    
                    if (selectedDateTime <= now) {
                      toast.error('과거 시간으로는 일정을 생성할 수 없습니다.');
                      return;
                    }
                    
                    // 같은 날짜에 다른 일정이 있는지 확인하고 1시간 이상 차이가 있는지 검증
                    const sameDateSchedules = editedSchedules.filter(s => s.date === newScheduleDate);
                    if (sameDateSchedules.length > 0) {
                      const hasConflict = sameDateSchedules.some(existingSchedule => {
                        const existingDateTime = new Date(`${existingSchedule.date}T${existingSchedule.time}`);
                        const timeDiffInMs = Math.abs(selectedDateTime.getTime() - existingDateTime.getTime());
                        const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);
                        return timeDiffInHours < 1;
                      });
                      
                      if (hasConflict) {
                        toast.error('같은 날짜의 일정은 최소 1시간 이상 차이가 있어야 합니다.');
                        return;
                      }
                    }
                    
                    const newId = Math.max(...editedSchedules.map(s => s.id), 0) + 1;
                    const newSchedule: MeetingSchedule = {
                      id: newId,
                      date: newScheduleDate,
                      time: timeString,
                    };
                    setEditedSchedules([...editedSchedules, newSchedule]);
                    setShowAddScheduleModal(false);
                    setNewScheduleDate('');
                    setNewScheduleTime('');
                    setNewScheduleHour('');
                    setNewScheduleMinute('00');
                    setNewSchedulePeriod('오전');
                  } else {
                    toast.error('날짜와 시간을 모두 입력해주세요.');
                  }
                }}
                className="flex-1 bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 리스트 모달 */}
      {showMemberListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowMemberListModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#00A651]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">멤버 리스트</h3>
            <p className="text-gray-600 mb-6 text-center">
              총 <span className="font-semibold text-[#00A651]">{members.length}명</span>의 멤버가 있습니다
            </p>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      {member.role === 'leader' && (
                        <span className="bg-[#00A651] text-white text-xs font-bold px-2 py-1 rounded-full">
                          리더
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(member.joinedDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} 가입
                    </p>
                  </div>
                  {/* 리더만 다른 멤버 추방 가능 (자기 자신 제외) */}
                  {isLeader && member.role !== 'leader' && member.name !== (user?.nickname || user?.email?.split('@')[0]) && (
                    <button
                      onClick={() => handleKickMember(member.id, member.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label="멤버 추방"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMemberListModal(false)}
              className="w-full bg-[#00A651] text-white font-bold py-3 px-6 rounded-full hover:bg-[#008E41] transition-colors mt-6"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 멤버 추방 확인 모달 */}
      {showKickMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => {
                setShowKickMemberModal(false);
                setMemberToKick(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {memberToKick?.name}님을 추방하시겠습니까?
            </h3>
            <p className="text-gray-600 mb-6">추방된 멤버는 모임에서 제외됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowKickMemberModal(false);
                  setMemberToKick(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmKickMember}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
              >
                추방
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신고하기 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportReason('');
                setReportDetails('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">사용자 신고하기</h3>
            <p className="text-gray-600 mb-6 text-center">
              <span className="font-semibold text-[#00A651]">{reportTargetUser}</span> 님을 신고합니다
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">신고 사유</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
                >
                  <option value="">선택해주세요</option>
                  <option value="욕설 및 비방">욕설 및 비방</option>
                  <option value="스팸/홍보">스팸/홍보</option>
                  <option value="음란물/선정성">음란물/선정성</option>
                  <option value="사기 의심">사기 의심</option>
                  <option value="개인정보 침해">개인정보 침해</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 내용 (선택)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="신고 사유를 자세히 설명해주세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900 resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!reportReason) {
                    toast.error('신고 사유를 선택해주세요');
                    return;
                  }
                  // 신고 처리 로직 (서버 연동 필요)
                  toast.success('신고가 접수되었습니다');
                  // 신고한 유저 목록에 추가
                  setReportedUsers(prev => new Set([...prev, reportTargetUser]));
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}