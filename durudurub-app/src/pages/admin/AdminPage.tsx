import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Search,
  MoreVertical,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Eye,
  Trash2,
  Shield,
  X,
  CheckCircle,
  Ban,
  Clock,
  Image,
  Link,
  Plus,
  Edit,
  Edit2,
  Folder,
  GripVertical,
} from 'lucide-react';
import styles from '@/pages/admin/AdminPage.module.css';
import { data } from 'react-router-dom';
// import { projectId, publicAnonKey } from 'utils/supabase/info';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AdminPageProps {
  onBack: () => void;
  user: any;
  accessToken: string | null;
  profileImage: string | null;
  onSignupClick: () => void;
  onLoginClick: () => void;
  onLogoClick: () => void;
  onNoticeClick: () => void;
  onMyPageClick: () => void;
  onMiniGameClick: () => void;
  onMyMeetingsClick: () => void;
  onLogout: () => void;
  onNavigateToCommunity?: (communityId: number) => void;
}

interface UserData {
  userNo: number;
  username: string;
  userId: string;
  createdAt: string;
  admin: boolean;
  subStatus?: string;
  reportCountAtBan?: number; // 신고 횟수
}

interface CommunityData {
  no: number;
  hostNo: number;
  title: string;
  category: { no: number; name: string };
  host: { username: string; };
  currentMembers: number;
  createdAt: string;
  status: 'active' | 'pending' | 'inactive';
}

interface ReportData {
  no: number;
  user: {
    no: number;
    userId: string;
    username: string;
  }

  reason: string;
  reportCountAtBan: number;
  banType: 'PERMANENT' | 'TEMPORARY';
  banEndDate: string | null;

  isActive: 'Y' | 'N';

  createdAt: string;
  updatedAt: string;
}

export interface BannerData {
  no: number;
  title: string;

  imageUrl: string;
  linkUrl: string;

  isActive: boolean;
  position: 'MAIN' | 'POPUP';

  seq: number;
  clickCount: number;
  description?: string | null;

  createdAt: string;
  // updateAt: string;

  startDate: string;
  endDate: string;
}

const ItemTypes = {
  SUBCATEGORY: 'subcategory',
  PARENT_CATEGORY: 'parentcategory'
};

interface DraggableSubCategoryProps {
  // sub: { no: number; name: string; description: string; createdAt: string; communityCount: number; subCategoryList?: SubCategory[]; parentId?: number | null; icon?: string };
  sub: SubCategory
  index: number;
  parentId: number;
  moveSubCategory: (parentId: number, dragIndex: number, hoverIndex: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

  function DraggableSubCategory({ sub, index, parentId, moveSubCategory, onEdit, onDelete }: DraggableSubCategoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 2초 후 자동으로 모드 해제
  useEffect(() => {
    if (isDeleteMode || isEditMode) {
      const timer = setTimeout(() => {
        setIsDeleteMode(false);
        setIsEditMode(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isDeleteMode, isEditMode]);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBCATEGORY,
    item: { index, parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isDeleteMode && !isEditMode, // 모드가 활성화되면 드래그 비활성화
  });
  const [, drop] = useDrop({
    accept: ItemTypes.SUBCATEGORY,
    hover(item: { index: number; parentId: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragParentId = item.parentId;

      // 같은 부모의 자식끼리만 순서 변경 가능
      if (dragParentId !== parentId) {
        return;
      }

      // 같은 위치면 아무것도 하지 않음
      if (dragIndex === hoverIndex) {
        return;
      }

      moveSubCategory(parentId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        borderRadius: '30px',
        border: isDeleteMode ? '2px solid #ef4444' : isEditMode ? '2px solid #00A651' : '2px solid #e5e7eb',
        backgroundColor: isDeleteMode ? '#fee2e2' : isEditMode ? '#f0fdf4' : '#ffffff',
        cursor: isDragging ? 'grabbing' : (isDeleteMode || isEditMode ? 'pointer' : 'grab'),
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDeleteMode ? '0 4px 6px -1px rgba(239, 68, 68, 0.1)' : isEditMode ? '0 4px 6px -1px rgba(0, 166, 81, 0.15)' : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isDeleteMode) {
          onDelete();
          setIsDeleteMode(false);
        } else if (isEditMode) {
          onEdit();
          setIsEditMode(false);
        } else {
          setIsDeleteMode(true);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteMode(false);
        setIsEditMode(true);
      }}
      onMouseEnter={(e) => {
        if (!isDeleteMode && !isEditMode) {
          e.currentTarget.style.borderColor = '#00A651';
          e.currentTarget.style.backgroundColor = '#f0fdf4';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 166, 81, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDeleteMode && !isEditMode) {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }
      }}
    >
      {/* 삭제 아이콘 (삭제 모드일 때만) */}
      {isDeleteMode && (
        <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
      )}
      
      {/* 수정 아이콘 (수정 모드일 때만) */}
      {isEditMode && (
        <Edit2 className="w-4 h-4" style={{ color: '#00A651' }} />
      )}
      
      {/* 카테고리명 */}
      <div style={{ 
        fontSize: '0.9375rem', 
        fontWeight: '600', 
        color: isDeleteMode ? '#ef4444' : isEditMode ? '#00A651' : '#374151',
        letterSpacing: '-0.01em',
      }}>
        {sub.name}
      </div>
    </div>
  );
}
interface SubCategory {
  no: number;
  categoryNo: number;
  name: string;
  seq: number;
  createdAt: string | null;
  updatedAt?: string | null;
  category?: any;
}


interface DraggableParentCategoryProps {
  parent: { no: number; name: string; description: string; createdAt: string; communityCount: number; subCategoryList?: SubCategory[]; parentId?: number | null; icon?: string };
  index: number;
  moveParentCategory: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
}

function DraggableParentCategory({ parent, index, moveParentCategory, onDelete, onEdit, children }: DraggableParentCategoryProps) {
  const ref = useRef<HTMLDivElement>(null);

  console.log('parent >>>> ', parent)
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PARENT_CATEGORY,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PARENT_CATEGORY,
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // 같은 위치면 아무것도 하지 않음
      if (dragIndex === hoverIndex) {
        return;
      }

      moveParentCategory(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
      }}
    >
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(135deg, rgba(0, 166, 81, 0.05) 0%, rgba(0, 166, 81, 0.02) 100%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      
      {/* 대분류 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f3f4f6',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <GripVertical className="w-5 h-5" style={{ color: '#9ca3af', cursor: 'grab', flexShrink: 0 }} />
          
          {/* 대분류 이미지 */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #00A651',
            flexShrink: 0,
            boxShadow: '0 4px 6px -1px rgba(0, 166, 81, 0.2)',
            background: parent.icon ? 'transparent' : 'linear-gradient(135deg, #00A651 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: '700',
          }}>
            {parent.icon ? (
              <img 
                src={parent.icon} 
                alt={parent.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              parent.name?.substring(0, 2) || '??'
            )}
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#111827', 
              margin: 0,
              marginBottom: '4px',
            }}>
              {parent.name}
            </h3>
            {parent.description && (
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                margin: 0,
                fontWeight: '500',
              }}>
                {parent.description}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px',
            backgroundColor: '#f0fdf4',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#00A651',
            border: '1px solid #bbf7d0',
          }}>
            {parent.subCategoryList?.length ?? 0}개 모임
          </div>
          {onEdit && (
            <button
              className={styles.editButton}
              onClick={onEdit}
              title="수정"
              style={{
                padding: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00A651';
                e.currentTarget.style.borderColor = '#00A651';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color  = '#6b7280';
              }}
            >
              <Edit2 className="w-5 h-5" style={{ color: '#6b7280', transition: 'color 0.2s' }} />
            </button>
          )}
          <button
            className={styles.deleteButton}
            onClick={onDelete}
            title="삭제"
            style={{
              padding: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.color  = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#fecaca';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.color  = '#ef4444';
            }}
          >
            <Trash2 className="w-5 h-5" style={{ color: '#ef4444', transition: 'color 0.2s' }} />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

export function AdminPage({
  onBack,
  user,
  accessToken,
  profileImage,
  onSignupClick,
  onLoginClick,
  onLogoClick,
  onNoticeClick,
  onMyPageClick,
  onMiniGameClick,
  onMyMeetingsClick,
  onLogout,
  onNavigateToCommunity,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'communities' | 'reports' | 'banners' | 'categories'>('dashboard');
  
  // 샘플 사용자 데이터
  const [users, setUsers] = useState<UserData[]>([]);
  
  // 샘플 모임 데이터
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  
  // 샘플 신고 데이터
  const [reports, setReports] = useState<ReportData[]>([]);
  
  // 배너 데이터
  const [banners, setBanners] = useState<BannerData[]>([]);

  // 대시 보드
  const [activity, setActivity] = useState<any>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityData | null>(null);
  const [showCommunityDetailModal, setShowCommunityDetailModal] = useState(false);
  const [showCommunityDeleteModal, setShowCommunityDeleteModal] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<number | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [showReportDeleteModal, setShowReportDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ userId: string; userName: string } | null>(null);
  const [blockType, setBlockType] = useState<'temporary' | 'permanent' | null>(null);
  const [blockDays, setBlockDays] = useState<number>(7); // 기본값 7일
  const [toastMessage, setToastMessage] = useState<string>('삭제 되었습니다');
  const [openReportDropdown, setOpenReportDropdown] = useState<number | null>(null);

  // 배너 관리 상태
  const [selectedBanner, setSelectedBanner] = useState<BannerData | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showBannerDetailModal, setShowBannerDetailModal] = useState(false);
  const [showBannerDeleteModal, setShowBannerDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    seq: 1,
    position: 'MAIN' as 'MAIN' | 'POPUP',
    startDate: null as string | null,
    endDate: null as string | null,
    clickCount: 0,
    description: '' as string | null,
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showBannerErrorModal, setShowBannerErrorModal] = useState(false);
  const [bannerErrorMessage, setBannerErrorMessage] = useState('');

  const [categories, setCategories] = useState<{ no: number; name: string; description: string; createdAt: string; communityCount: number; subCategoryList?: SubCategory[]; parentId: number | null; icon?: string }[]>([]);
  useEffect(() => {
    loadCategories();
  }, [])
  
  const loadCategories = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/categories', { headers });
      const data = await res.json();
      setCategories(
        (data || []).sort((a, b) => a.no - b.no)
      );
    } catch (error) {
      console.error('커뮤니티 조회 실패 : ', error);
    } finally {
      setLoading(false);
    }
  }

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ no: number; name: string; description: string; createdAt: string; communityCount: number; subCategoryList?: SubCategory[]; parentId?: number | null; icon?: string } | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', parentId: null as number | null, icon: '' });
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  // 소분류 순서 변경 함수
  const moveSubCategory = (parentId: number, dragIndex: number, hoverIndex: number) => {
    const subCategories = categories.filter(c => c.no === parentId);
    const draggedItem = subCategories[dragIndex];
    
    // 드래그된 항목을 제거하고 새 위치에 삽입
    const updatedSubCategories = [...subCategories];
    updatedSubCategories.splice(dragIndex, 1);
    updatedSubCategories.splice(hoverIndex, 0, draggedItem);
    
    // 전체 카테고리 목록에서 해당 부모의 소분류들만 순서 변경
    const otherCategories = categories.filter(c => c.no !== parentId);
    setCategories([...otherCategories, ...updatedSubCategories]);
  };

  // 대분류 순서 변경 함수
  const moveParentCategory = (dragIndex: number, hoverIndex: number) => {
    const parentCategories = categories.filter(c => !c.parentId);
    const draggedItem = parentCategories[dragIndex];
    
    // 드래그된 항목을 제거하고 새 위치에 삽입
    const updatedParentCategories = [...parentCategories];
    updatedParentCategories.splice(dragIndex, 1);
    updatedParentCategories.splice(hoverIndex, 0, draggedItem);
    
    // 전체 카테고리 목록에서 대분류만 순서 변경
    const subCategories = categories.filter(c => c.parentId);
    setCategories([...updatedParentCategories, ...subCategories]);
  };

  // 관리자 권한 확인
  const isAdmin = user?.isAdmin === true || user?.userId === 'admin';

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    } else if (isAdmin && activeTab === 'communities') {
      loadCommunities();
    } else if (isAdmin && activeTab === 'reports') {
      loadBan();
    } else if (isAdmin && activeTab === 'banners') {
      loadBanners();
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
      if (openReportDropdown) {
        setOpenReportDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown, openReportDropdown]);

  useEffect(() => {
    loadActivity();
  },[]);

  // 대시보드
  const loadActivity = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch("/api/admin/dashboard", { headers });
      console.log("res ??? ", res);
      const data = await res.json()
      console.log("userData ??? ", data)
      setActivity(data)
    } catch (error) {
      console.error('관리자 대시보드 불러오는 중 오류: ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  console.log('탭:', activeTab);
  console.log('관리자 여부:', isAdmin);

  if (isAdmin && activeTab === 'users') {
    console.log('🔥 loadUsers 실행됨');
    loadUsers();
  }
}, [activeTab, isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('사용자 >>>> ', data)
        setUsers(data || []);
      }


    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `/api/admin/clubs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCommunities(data || []);
      }
    } catch (error) {
      // Mock 데이터 사용 (Supabase 연결 실패 시)
      console.log('모임 목록: Mock 데이터 사용 중');
    } finally {
      setLoading(false);
    }
  };

  const loadBan = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `/api/admin/reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data || []);
      }
      console.log("response status", response.status)
    } catch (error) {
      // Mock 데이터 사용 (Supabase 연결 실패 시)
      console.log('모임 목록: Mock 데이터 사용 중');
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `/api/admin/banners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json()
      if (response.ok) {
        console.log("bannerList >>>>> ", data)
      }

      setBanners(
        data.map((b: any) => ({
          ...b,
          isActive: b.isActive === 'Y'
        }))
      )
      
    } catch (error) {
      // Mock 데이터 사용 (Supabase 연결 실패 시)
      console.log('배너 목록: Mock 데이터 사용 중');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBannerPosition = async (
    e: React.MouseEvent,
    banner: BannerData
  ) => {
    e.stopPropagation();

    const newPosition = banner.position === 'MAIN' ? 'POPUP' : 'MAIN';

    try {
      const token = sessionStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/banners/${banner.no}/position`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({position: newPosition})
      });
      
      if (!res.ok) throw new Error("배너 위치 변경 실패");

      setBanners(prev =>
        prev.map(b =>
          b.no === banner.no ? { ...b, position: newPosition } : b
        )
      );
      console.log("res >>>> ", res)
    } catch (error) {
      console.error("배너 위치 변경 오류", error);
    }
  }

  const handleToggleBannerIsActivity = async (
    e: React.MouseEvent,
    banner: BannerData
  ) => {
    e.stopPropagation();

    const newActivity = !banner.isActive;

    try {
      const token = sessionStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/banners/${banner.no}/active`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({isActive: newActivity ? 'Y' : 'N'})
      });
      
      if (!res.ok) throw new Error("배너 활성화 변경 실패");

      setBanners(prev =>
        prev.map(b =>
          b.no === banner.no ? { ...b, isActive: newActivity } : b
        )
      );
      console.log("res >>>> ", res)
      console.log("banner.isActive", banner.isActive, typeof banner.isActive)

    } catch (error) {
      console.error("배너 활성화 변경 오류", error);
    }
  }

  const saveBanner = async () => {
    // 프론트엔드 전용 배너 저장
    if (!bannerFormData.title || !bannerFormData.linkUrl) {
      setBannerErrorMessage('제목과 링크 URL을 입력해주세요.');
      setShowBannerErrorModal(true);
      return;
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append("title", bannerFormData.title)
      formData.append("linkUrl", bannerFormData.linkUrl)
      formData.append("description", bannerFormData.description)
      formData.append("seq", String(bannerFormData.seq))
      formData.append("isActive", bannerFormData.isActive ? "Y" : "N")
      if (bannerFormData.startDate) {
        formData.append("startDate", bannerFormData.startDate);
      }

      if (bannerFormData.endDate) {
        formData.append("endDate", bannerFormData.endDate);
      }

      // 이미지 파일이 업로드되었다면 로컬 URL 사용
      if (uploadedImage) {
        formData.append("imageFile", uploadedImage)
      } else if (bannerFormData.imageUrl) {
        formData.append("imageUrl", bannerFormData.imageUrl)
      }

      const url = selectedBanner
        ? `/api/admin/banners/${selectedBanner.no}`
        : `/api/admin/banners/insert`;

      const method = selectedBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("서버 에러:", errorText);
        throw new Error(errorText);
      }

      const savedBanner = await res.json()

      // 서버 데이터 기준으로 리스트 갱신
      if (selectedBanner) {
        // 수정
        setBanners(banners.map(b => b.no === savedBanner.no ? savedBanner : b));
        setToastMessage('배너가 수정되었습니다');
      } else {
        // 추가
        setBanners([...banners, savedBanner]);
        setToastMessage('배너가 추가되었습니다');
      }

      await loadBanners()

      setShowBannerModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (error) {
      console.error(error);
      setBannerErrorMessage('배너 저장 중 오류가 발생했습니다.')
      setShowBannerModal(true)
    }
  };

  const deleteBanner = async (
    bannerNo: number
  ) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/banners/${bannerNo}/delete`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

     if (!res.ok) {
        const errorText = await res.text();
        console.log("status:", res.status);
        console.log("error:", errorText);
        throw new Error("삭제 실패");
      }

      setBanners(prev =>
        prev.filter(b =>
          b.no !=  bannerNo
        )
      );

    } catch (error) {
      console.error(error)
      setBannerErrorMessage('배너 삭제 중 오류가 발생했습니다.')
      setShowBannerModal(true)
    }  
  };

const savedCategory = async () => {
  if (!categoryFormData.name.trim()) return;

  const isDuplicate = categories.some(
    c => c.name === categoryFormData.name && c.no !== selectedCategory?.no
  );

  if (isDuplicate) {
    setToastMessage('이미 존재하는 카테고리 이름입니다.');
    setShowToast(false);
    setTimeout(() => setShowToast(true), 0);
    setTimeout(() => setShowToast(false), 2000);
    return;
  }

  const token = sessionStorage.getItem('accessToken');

  try {
    let url = '';
    let method = '';
    let body: BodyInit;
    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (selectedCategory) {

      if (selectedCategory.parentId) {
        url = `/api/admin/categories/subs/${selectedCategory.no}`;
        method = 'PUT';

        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description,
        });

      } 
      else {
        url = `/api/admin/categories/${selectedCategory.no}/update`;
        method = 'PUT';

        const formData = new FormData();
        formData.append("name", categoryFormData.name);
        formData.append("description", categoryFormData.description);

        if (iconFile) {
          formData.append("iconFile", iconFile);
        }

        body = formData;
      }

    } 
    
    else {
      if (categoryFormData.parentId) {
        url = `/api/admin/categories/${categoryFormData.parentId}/subs`;
        method = 'POST';

        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description,
        });

      } 
      else {
        url = `/api/admin/categories/create`;
        method = 'POST';

        const formData = new FormData();
        formData.append("name", categoryFormData.name);
        formData.append("description", categoryFormData.description);

        if (iconFile) {
          formData.append("iconFile", iconFile);
        }

        body = formData;
      }
    }

    if (body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      console.error('savedCategory Fail:', await response.text());
      setToastMessage('카테고리 저장 실패');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    setToastMessage(
      selectedCategory ? '카테고리 수정 완료' : '카테고리 추가 완료'
    );

    setShowToast(false);
    setTimeout(() => setShowToast(true), 0);
    setTimeout(() => setShowToast(false), 2000);

    await loadCategories();
    setShowCategoryModal(false);

  } catch (error) {
    console.error("카테고리 추가/수정 실패", error);

    setToastMessage('카테고리 처리 중 오류 발생');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }
};

const handleDeleteCategory = async () => {
  if (!categoryToDelete) return;
  
  const category = categories.find(c => c.no === categoryToDelete);
  const isSubCategory = !!category?.parentId;

  const hasChildren = categories.some(
    c => c.parentId === categoryToDelete
  );

  if (hasChildren) {
    setToastMessage('하위 카테고리가 존재하여 삭제할 수 없습니다');
    setShowToast(false);
    setTimeout(() => setShowToast(true), 0);
    setTimeout(() => setShowToast(false), 2000);

    return;
  }

  const token = sessionStorage.getItem('accessToken');

  try {
    const url = isSubCategory
      ? `/api/admin/categories/subs/${categoryToDelete}`
      : `/api/admin/categories/${categoryToDelete}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    if (!response.ok) {
      console.log('categoryDelete FAIL');
    }

    setCategories(prev =>
      prev.filter(c => c.no !== categoryToDelete)
    );

    setToastMessage('카테고리가 삭제되었습니다');
  } catch (error) {
    console.error(error);
    setToastMessage('카테고리 삭제에 실패했습니다');
  } finally {
    setShowCategoryDeleteModal(false);

    setTimeout(() => setShowToast(false), 2000);
  }
};

  // 관리자가 아닌 경우
  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.accessDenied}>
            <Shield className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">접근 권한이 없습니다</h2>
            <p className="text-gray-500 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
            <button onClick={onBack} className={styles.backButton}>
              메인으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredUsers);
  const filteredCommunities = communities.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredCommunities);

  const filteredReports = reports.filter(
    (r) =>
      r.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("filteredReports>>>> ", filteredReports);

  // ��한 변경 함수
  const handleToggleSubscription = (userId: number) => {
    setUsers(users.map(u => 
      u.userNo === userId ? { ...u, isSubscribed: !u.subStatus } : u
    ));
    setOpenDropdown(null);
    alert('권한이 변경되었습니다.');
  };

  // 사용자 삭제 함수
  const handleDeleteUser = async (userNo: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/users/${userNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      setUsers(users.filter(u => u.userNo !== userNo));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (error) {
      console.error("유저 삭제 실패", error);
    }
  };

  // 모임 삭제 함수
  const handleDeleteCommunity = async (clubNo: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/clubs/${clubNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      setCommunities(communities.filter(c => c.no !== clubNo));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (error) {
      console.error("유저 삭제 실패", error);
    }
  };

  // 신고된 사용자 삭제 함수
  const handleDeleteReport  = async (userNo: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/reports/${userNo}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }

      // 신고 목록에서 제거
      setReports(prev => prev.filter(r => r.no !== userNo));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (error) {
      console.error("유저 삭제 실패", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.contentWrapper}>
          {/* 헤더 */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>관리자 대시보드</h1>
              <p className={styles.subtitle}>두루두룹 서비스 관리</p>
            </div>
            <button onClick={onBack} className={styles.backButtonSmall}>
              메인으로
            </button>
          </div>

          {/* 탭 메뉴 */}
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>대시보드</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
            >
              <Users className="w-5 h-5" />
              <span>사용자 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`${styles.tab} ${activeTab === 'communities' ? styles.tabActive : ''}`}
            >
              <FileText className="w-5 h-5" />
              <span>모임 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`${styles.tab} ${activeTab === 'reports' ? styles.tabActive : ''}`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>신고 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`${styles.tab} ${activeTab === 'banners' ? styles.tabActive : ''}`}
            >
              <Image className="w-5 h-5" />
              <span>광고 배너 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`${styles.tab} ${activeTab === 'categories' ? styles.tabActive : ''}`}
            >
              <Folder className="w-5 h-5" />
              <span>카테고리 관리</span>
            </button>
          </div>

          {/* 대시보드 탭 */}
          {activeTab === 'dashboard' && (
            <div className={styles.dashboardContent}>
              {/* 통계 카드 */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#E8F5E9' }}>
                    <Users className="w-6 h-6" style={{ color: '#00A651' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>전체 사용자</p>
                    <p className={styles.statValue}>{activity.totalUsers}</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#FFF3E0' }}>
                    <FileText className="w-6 h-6" style={{ color: '#FF9800' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>전체 모임</p>
                    <p className={styles.statValue}>{activity.totalClubs}</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#F3E5F5' }}>
                    <Shield className="w-6 h-6" style={{ color: '#9C27B0' }} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>신고 접수 내역</p>
                    <p className={styles.statValue}>{activity.totalReports}</p>
                  </div>
                </div>
              </div>

              {/* 최근 활동 */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>최근 활동</h2>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ backgroundColor: '#E3F2FD' }}>
                      <CheckCircle className="w-5 h-5" style={{ color: '#2196F3' }} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {activity.lastestClub === null
                          ? '새로 가입된 모임이 없습니다.'
                          : `새로운 모임 ${activity.lastestClubTitle}가 추가됬습니다.`}
                      </p>
                      <p className={styles.activityTime}>
                        {activity.lastestClubTime}
                      </p>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ backgroundColor: '#E8F5E9' }}>
                      <Users className="w-5 h-5" style={{ color: '#00A651' }} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {activity.totalNew === 0
                          ? '새로 가입한 사용자가 없습니다.'
                          : `새로운 사용자 ${activity.totalNew}가 가입했습니다.`}
                      </p>
                      <p className={styles.activityTime}>
                        {activity.lastestUser}
                      </p>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ backgroundColor: '#F3E5F5' }}>
                      <Shield className="w-5 h-5" style={{ color: '#9C27B0' }} />
                      {/* <FileText className="w-5 h-5" style={{ color: '#FF9800' }} /> */}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {activity.totalNewReports === 0
                          ? '새로 접수된 신고가 없습니다.'
                          : `새로운 신고가 ${activity.totalNewReports}건 접수되었습니다`}
                      </p>
                      <p className={styles.activityTime}>
                        {activity.lastestUserBan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 사용자 관리 탭 */}
          {activeTab === 'users' && (
            <div className={styles.tabContent}>
              {/* 검색 바 */}
              <div className={styles.searchBar}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="닉네임 또는 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* 사용자 테이블 */}
              {loading ? (
                <div className={styles.loadingState}>로딩 중...</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>닉네임</th>
                        <th>이메일</th>
                        <th>가입일</th>
                        <th>구독 상태</th>
                        <th>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr 
                            key={user.userNo}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetailModal(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{user.username}</td>
                            <td>{user.userId}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                            <td>
                              <span className={
                                user.admin 
                                  ? styles.badgeAdmin 
                                  : user.subStatus === 'ACTIVE'
                                  ? styles.badgeSubscribed 
                                  : styles.badgeUser
                              }>
                                {user.admin 
                                  ? '관리자' 
                                  : user.subStatus === 'ACTIVE'
                                  ? '구독 중' 
                                  : '미구독'}
                              </span>
                            </td>
                            <td>
                              {!user.admin && (
                                <button
                                  className={styles.deleteButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserToDelete(user.userNo);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={styles.emptyCell}>
                            {searchTerm ? '검색 결과가 없습니다' : '사용자 데이터를 불러오는 중입니다'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 모임 관리 탭 */}
          {activeTab === 'communities' && (
            <div className={styles.tabContent}>
              {/* 검색 바 */}
              <div className={styles.searchBar}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="모임명 또는 카테고리 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* 모임 테이블 */}
              {loading ? (
                <div className={styles.loadingState}>로딩 중...</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>모임명</th>
                        <th>카테고리</th>
                        <th>리더</th>
                        <th>멤버 수</th>
                        <th>생성일</th>
                        <th>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className={styles.emptyCell}>
                            모임 데이터를 불러오는 중입니다
                          </td>
                        </tr>
                      ) : filteredCommunities.length > 0 ? (
                        filteredCommunities.map((community) => (
                          <tr 
                            key={community.no}
                            onClick={() => {
                              setSelectedCommunity(community);
                              setShowCommunityDetailModal(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{community.title}</td>
                            <td>{community.category.name}</td>
                            <td>{community.host.username}</td>
                            <td>{community.currentMembers}</td>
                            <td>{new Date(community.createdAt).toLocaleDateString('ko-KR')}</td>
                            <td>
                              <button
                                className={styles.deleteButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCommunityToDelete(community.no);
                                  setShowCommunityDeleteModal(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className={styles.emptyCell}>
                            {searchTerm ? '검색 결과가 없습니다' : '등록된 모임이 없습니다'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 신고 관리 탭 */}
          {activeTab === 'reports' && (
            <div className={styles.tabContent}>
              {/* 검색 바 */}
              <div className={styles.searchBar}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="신고된 사용자 또는 신고 사유 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* 신고 테이블 */}
              {loading ? (
                <div className={styles.loadingState}>로딩 중...</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>신고된 사용자 닉네임</th>
                        <th>이메일</th>
                        <th>신고 사유</th>
                        <th>신고 날짜</th>
                        <th>만료 날짜</th>
                        <th style={{ textAlign: 'center' }}>신고 당한 횟수</th>
                        <th style={{ textAlign: 'center' }}>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className={styles.emptyCell}>
                            신고 데이터를 불러오는 중입니다
                          </td>
                        </tr>
                      ) : filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                          <tr key={report.no}>
                            <td>{report.user.username || '알 수 없음'}</td>
                            <td>{report.user.userId || '알 수 없음'}</td>
                            <td>{report.reason}</td>
                            <td>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</td>
                            <td>
                              {report.banEndDate
                                ? new Date(report.banEndDate).toLocaleDateString('ko-KR')
                                : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className={
                                  (report.reportCountAtBan ?? 0) >= 5
                                    ? styles.reportCountDanger
                                    : styles.reportCountBadge
                                }
                              >
                                {(report.reportCountAtBan ?? 0)}회
                              </span>
                            </td>
                            <td>
                              <button
                                className={styles.deleteButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportToDelete(report.no);
                                  setShowReportDeleteModal(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className={styles.emptyCell}>
                            {searchTerm ? '검색 결과가 없습니다' : '등록된 신고가 없습니다'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 광고 배너 수정 탭 */}
          {activeTab === 'banners' && (
            <div className={styles.tabContent}>
              {/* 헤더: 배너 추가 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle}>광고 배너 관리</h2>
                <button
                  className={styles.modalButtonPrimary}
                  style={{ backgroundColor: '#00A651', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    setSelectedBanner(null);
                    setBannerFormData({
                      title: '',
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true,
                      seq: banners.length + 1,
                      position: 'MAIN',
                      startDate: '',
                      endDate: '',
                      clickCount: 0,
                      description: '',
                    });
                    setUploadedImage(null);
                    setShowBannerModal(true);
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>배너 추가</span>
                </button>
              </div>

              {/* 배너 테이블 */}
              <div className={styles.bannerTableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '100px', textAlign: 'center' }}>순서</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>미리보기</th>
                      <th>제목</th>
                      <th>링크 URL</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>배너 위치</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>상태</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.length > 0 ? (
                      banners.sort((a, b) => a.seq - b.seq).map((banner) => (
                        <tr 
                          key={banner.no} 
                          style={{ opacity: banner.isActive ? 1 : 0.4, cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedBanner(banner);
                            setShowBannerDetailModal(true);
                          }}
                        >
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{banner.seq}</td>
                          <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              style={{
                                width: '100%',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb',
                              }}
                            />
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>{banner.title}</td>
                          <td style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280', 
                            verticalAlign: 'middle',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{banner.linkUrl}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <span
                              onClick={(e) => {
                                handleToggleBannerPosition(e, banner)
                              }}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: banner.position === 'POPUP' ? '#e0e7ff' : '#ffedd5',
                                color: banner.position === 'POPUP' ? '#4f46e5' : '#ea580c',
                                cursor: 'pointer',
                              }}
                            >
                              {banner.position}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <span
                                onClick={(e) => {
                                  handleToggleBannerIsActivity(e, banner);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: banner.isActive ? '#d1fae5' : '#f3f4f6',
                                  color: banner.isActive ? '#00A651' : '#6b7280',
                                  cursor: 'pointer',
                                }}
                              >
                                {banner.isActive ? '활성화' : '비활성화'}
                              </span>
                          </div>
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                className={styles.actionButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBanner(banner);
                                  setBannerFormData({
                                    title: banner.title,
                                    imageUrl: banner.imageUrl,
                                    linkUrl: banner.linkUrl,
                                    isActive: banner.isActive,
                                    seq: banner.seq,
                                    position: banner.position,
                                    startDate: banner.startDate ? banner.startDate.slice(0,10) : "",
                                    endDate: banner.endDate ? banner.endDate.slice(0,10) : "",
                                    clickCount: banner.clickCount,
                                    description: banner.description || '',
                                  });
                                  setUploadedImage(null);
                                  setShowBannerModal(true);
                                }}
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBannerToDelete(banner.no);
                                  setShowBannerDeleteModal(true);
                                }}
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className={styles.emptyCell}>
                          등록된 배너가 없습니다
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 카테고리 관리 탭 */}
          {activeTab === 'categories' && (() => {
            const parentCategories = categories.filter(c => !c.parentId);
            const getSubCategories = (parentId: number) => categories.filter(c => c.parentId  === parentId);
            
            return (
              <div className={styles.tabContent}>
                {/* 헤더: 카테고리 추가 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.sectionTitle}>카테고리 관리</h2>
                  <button
                    className={styles.modalButtonPrimary}
                    style={{ backgroundColor: '#00A651', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryFormData({ name: '', description: '', parentId: null, icon: '' });
                      setShowCategoryModal(true);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>대분류 추가</span>
                  </button>
                </div>

                {/* 카테고리 카드 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {parentCategories.map((parent, parentIndex) => {
                    const subCategories = getSubCategories(parent.no);
                    
                    return (
                      <DraggableParentCategory
                        key={parent.no}
                        parent={parent}
                        index={parentIndex}
                        moveParentCategory={moveParentCategory}
                        onEdit={() => {
                          setSelectedCategory(parent);
                          setCategoryFormData({ name: parent.name, description: parent.description, parentId: null, icon: parent.icon || '' });
                          setShowCategoryModal(true);
                        }}
                        onDelete={() => {
                          setCategoryToDelete(parent.no);
                          setShowCategoryDeleteModal(true);
                        }}
                      >
                        {/* 소분류 태그들 */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          alignItems: 'center',
                        }}>
                          {(parent.subCategoryList ?? []).map((sub, index) => (
                            <DraggableSubCategory
                              key={sub.no}
                              sub={sub}
                              index={index}
                              parentId={parent.no}
                              moveSubCategory={moveSubCategory}
                              onEdit={() => {
                                setSelectedCategory({
                                  no: sub.no,
                                  name: sub.name,
                                  description: '', 
                                  createdAt: sub.createdAt ?? '',
                                  communityCount: 0, 
                                  parentId: parent.no,
                                  icon: ''
                                });

                                setCategoryFormData({
                                  name: sub.name,
                                  description: '',
                                  parentId: parent.no, 
                                  icon: ''
                                });

                                setShowCategoryModal(true);
                              }}
                              onDelete={() => {
                                setCategoryToDelete(sub.no);
                                setShowCategoryDeleteModal(true);
                              }}
                            />
                          ))}
                          
                          {/* 소분류 추가 버튼 */}
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 16px',
                              borderRadius: '30px',
                              border: '2px dashed #d1d5db',
                              backgroundColor: '#fafafa',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onClick={() => {
                              setSelectedCategory(null);
                              setCategoryFormData({ name: '', description: '', parentId: parent.no, icon: '' });
                              setShowCategoryModal(true);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#00A651';
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 166, 81, 0.15)';
                              const icon = e.currentTarget.querySelector('svg');
                              const text = e.currentTarget.querySelector('div');
                              if (icon) (icon).style.color = '#00A651';
                              if (text) (text as HTMLElement).style.color = '#00A651';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.backgroundColor = '#fafafa';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                              const icon = e.currentTarget.querySelector('svg');
                              const text = e.currentTarget.querySelector('div');
                              if (icon) (icon).style.color = '#9ca3af';
                              if (text) (text as HTMLElement).style.color = '#9ca3af';
                            }}
                          >
                            <Plus className="w-5 h-5" style={{ color: '#9ca3af', transition: 'color 0.2s' }} />
                            <div style={{ 
                              fontSize: '0.9375rem', 
                              fontWeight: '600', 
                              color: '#9ca3af',
                              transition: 'color 0.2s',
                            }}>
                              소분류 추가
                            </div>
                          </div>
                        </div>
                      </DraggableParentCategory>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* 사용자 상세 정보 모달 */}
      {showUserDetailModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowUserDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>사용자 상세 정보</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowUserDetailModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>닉네임</div>
                <div className={styles.detailValue}>{selectedUser.username}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>이메일</div>
                <div className={styles.detailValue}>{selectedUser.userId}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>가입일</div>
                <div className={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>구독 상태</div>
                <div className={styles.detailValue}>
                  <span className={
                    selectedUser.admin 
                      ? styles.badgeAdmin 
                      : selectedUser.subStatus === 'ACTIVE'
                      ? styles.badgeSubscribed 
                      : styles.badgeUser
                  }>
                    {selectedUser.admin 
                      ? '관리자' 
                      : selectedUser.subStatus === 'ACTIVE'
                      ? '구독 중' 
                      : '미구독'}
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>신고 횟수</div>
                <div className={styles.detailValue}>
                  <span className={styles.reportCountBadge}>
                    {(user.reportCountAtBan ?? 0)}회
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>사용자 ID</div>
                <div className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>#{selectedUser.userNo}</div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowUserDetailModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 삭제 확인 모달 */}
      {showDeleteModal && userToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>사용자 삭제 확인</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>정말로 사용자 ID #{userToDelete}을 삭제하시겠습니까?</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => {
                  handleDeleteUser(userToDelete);
                  setShowDeleteModal(false);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모임 상세 정보 모달 */}
      {showCommunityDetailModal && selectedCommunity && (
        <div className={styles.modalOverlay} onClick={() => setShowCommunityDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>모임 상세 정보</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowCommunityDetailModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>모임명</div>
                <div className={styles.detailValue}>{selectedCommunity.title}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>카테고리</div>
                <div className={styles.detailValue}>{selectedCommunity.category.name}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>리더</div>
                <div className={styles.detailValue}>{selectedCommunity.host.username}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>멤버 수</div>
                <div className={styles.detailValue}>{selectedCommunity.currentMembers}명</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>생성일</div>
                <div className={styles.detailValue}>
                  {new Date(selectedCommunity.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>상태</div>
                <div className={styles.detailValue}>
                  <span className={
                    selectedCommunity.status === 'active' 
                      ? styles.badgeSubscribed 
                      : selectedCommunity.status === 'pending'
                      ? styles.badgePending
                      : styles.badgeUser
                  }>
                    {selectedCommunity.status === 'active' ? '활성' : selectedCommunity.status === 'pending' ? '대기' : '비활성'}
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>모임 ID</div>
                <div className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>#{selectedCommunity.no}</div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowCommunityDetailModal(false)}
              >
                닫기
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => {
                  // 모임 상세 페이지로 이동
                  if (onNavigateToCommunity) {
                    onNavigateToCommunity(selectedCommunity.no);
                  }
                  setShowCommunityDetailModal(false);
                }}
                style={{ backgroundColor: '#00A651' }}
              >
                이동하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모임 삭제 확인 모달 */}
      {showCommunityDeleteModal && communityToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowCommunityDeleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>모임 삭제 확인</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowCommunityDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>정말로 모임 ID #{communityToDelete}을 삭제하시겠습니까?</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowCommunityDeleteModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => {
                  handleDeleteCommunity(communityToDelete);
                  setShowCommunityDeleteModal(false);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신고 삭제 확인 모달 */}
      {showReportDeleteModal && reportToDelete && (() => {
        const report = reports.find(r => r.no === reportToDelete);
        return (
          <div className={styles.modalOverlay} onClick={() => setShowReportDeleteModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>신고된 사용자 삭제 확인</h2>
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setShowReportDeleteModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className={styles.modalBody}>
                {report?.user.username ? (
                  <p className={styles.modalText}>
                    신고된 사용자 <strong>{report.user.username}</strong>를 삭제하시겠습니까?<br />
                    해당 신고 기록도 함께 삭제됩니다.
                  </p>
                ) : (
                  <p className={styles.modalText}>
                    정말로 신고 ID #{reportToDelete}을 삭제하시겠습까?
                  </p>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalButtonSecondary}
                  onClick={() => setShowReportDeleteModal(false)}
                >
                  취소
                </button>
                <button
                  className={styles.modalButtonPrimary}
                  onClick={() => {
                    handleDeleteReport(reportToDelete);
                    setShowReportDeleteModal(false);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* 배너 추가/수정 모달 */}
      {showBannerModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBannerModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedBanner ? '배너 수정' : '배너 추가'}</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowBannerModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>배너 제목</label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  placeholder="배너 제목을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>이미지</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={bannerFormData.imageUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                  <label
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#00A651',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    파일 선택
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedImage(file);
                          // 미리보기를 위해 로컬 URL 생성
                          const localUrl = URL.createObjectURL(file);
                          setBannerFormData({ ...bannerFormData, imageUrl: localUrl });
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {uploadedImage ? `선택된 파일: ${uploadedImage.name}` : 'URL 입력 또는 파일 선택 (권장 사이즈: 800x200px)'}
                </p>
              </div>

              {bannerFormData.imageUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>미리보기</label>
                  <img
                    src={bannerFormData.imageUrl}
                    alt="배너 미리보기"
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>링크 URL</label>
                <input
                  type="text"
                  value={bannerFormData.linkUrl}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, linkUrl: e.target.value })}
                  placeholder="/payment 또는 https://example.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>설명</label>
                <textarea
                  value={bannerFormData.description}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                  placeholder="배너에 대한 간단한 설명을 입력하세요 (선택 사항)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>노출 시작일</label>
                  <input
                    type="date"
                    value={bannerFormData.startDate ?? ""}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>노출 종료일</label>
                  <input
                    type="date"
                    value={bannerFormData.endDate ?? ""}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>표시 순서</label>
                <input
                  type="number"
                  min="1"
                  value={bannerFormData.seq}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, seq: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bannerFormData.isActive}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>배너 활성화</span>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowBannerModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={saveBanner}
                style={{ backgroundColor: '#00A651' }}
              >
                {selectedBanner ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배너 상세 정보 모달 */}
      {showBannerDetailModal && selectedBanner && (
        <div className={styles.modalOverlay} onClick={() => setShowBannerDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>배너 상세 정보</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowBannerDetailModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>제목</div>
                <div className={styles.detailValue}>{selectedBanner.title}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>이미지</div>
                <div className={styles.detailValue}>
                  <img
                    src={selectedBanner.imageUrl}
                    alt={selectedBanner.title}
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>링크 URL</div>
                <div className={styles.detailValue}>{selectedBanner.linkUrl}</div>
              </div>
              {selectedBanner.description && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>설명</div>
                  <div className={styles.detailValue} style={{ color: '#374151', lineHeight: '1.6' }}>
                    {selectedBanner.description}
                  </div>
                </div>
              )}
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>활성화 여부</div>
                <div className={styles.detailValue}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: selectedBanner.isActive ? '#d1fae5' : '#f3f4f6',
                      color: selectedBanner.isActive ? '#00A651' : '#6b7280',
                    }}
                  >
                    {selectedBanner.isActive ? '활성화' : '비활성화'}
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>노출 시작일</div>
                <div className={styles.detailValue}>{selectedBanner.startDate ? selectedBanner.startDate.slice(0,10) : ""}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>노출 종료일</div>
                <div className={styles.detailValue}>{selectedBanner.endDate ? selectedBanner.endDate.slice(0,10) : ""}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>정렬 순서</div>
                <div className={styles.detailValue}>{selectedBanner.seq}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>클릭 수</div>
                <div className={styles.detailValue}>
                  <span style={{ fontWeight: '600', color: '#00A651' }}>
                    {selectedBanner.clickCount.toLocaleString()}회
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowBannerDetailModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배너 삭제 확인 모달 */}
      {showBannerDeleteModal && bannerToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowBannerDeleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>배너 삭제 확인</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowBannerDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>정말로 이 배너를 삭제하시겠습니까?</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowBannerDeleteModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => {
                  if (bannerToDelete) {
                    deleteBanner(bannerToDelete);
                  }
                  setShowBannerDeleteModal(false);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배너 오류 모달 */}
      {showBannerErrorModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBannerErrorModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>알림</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowBannerErrorModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>{bannerErrorMessage}</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonPrimary}
                onClick={() => setShowBannerErrorModal(false)}
                style={{ backgroundColor: '#00A651' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 추가/수정 모달 */}
      {showCategoryModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedCategory ? '카테고리 수정' : '카테고리 추가'}</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowCategoryModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* 대표 이미지 썸네일 - 대분류인 경우 최상단에 표시 */}
              {!categoryFormData.parentId && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  <div 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #00A651',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById('category-image-upload') as HTMLInputElement;
                      fileInput?.click();
                    }}
                    onMouseEnter={(e) => {
                      const overlay = e.currentTarget.querySelector('div');
                      if (overlay) (overlay as HTMLElement).style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const overlay = e.currentTarget.querySelector('div');
                      if (overlay) (overlay as HTMLElement).style.opacity = '0';
                    }}
                  >
                    <img 
                      src={categoryFormData.icon || 'https://images.unsplash.com/photo-1762503203730-ca33982518af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwZ3JhZGllbnQlMjBwYXR0ZXJufGVufDF8fHx8MTc3MDEwODQ2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'} 
                      alt="카테고리 이미지" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}>
                      <Edit2 className="w-8 h-8" style={{ color: '#ffffff' }} />
                    </div>
                  </div>
                  <input
                    id="category-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIconFile(file);
                        
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCategoryFormData({ ...categoryFormData, icon: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  분류 타입
                </label>
                <div style={{ 
                  padding: '10px 12px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {categoryFormData.parentId 
                    ? `소분류 (상위: ${categories.find(c => c.no === categoryFormData.parentId)?.name || '알 수 없음'})` 
                    : '대분류'}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>카테고리명 *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 5) {
                      setCategoryFormData({ ...categoryFormData, name: value });
                    }
                  }}
                  placeholder="예: 독서, 운동, 요리"
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  {categoryFormData.name.length}/5자
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>설명</label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="카테고리에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowCategoryModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={savedCategory}
                style={{ backgroundColor: '#00A651' }}
              >
                {selectedCategory ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 삭제 확인 모달 */}
      {showCategoryDeleteModal && categoryToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowCategoryDeleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>카테고리 삭제 확인</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowCategoryDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                정말로 이 카테고리를 삭제하시겠습니까?
                {(() => {
                  const category = categories.find(c => c.no === categoryToDelete);
                  return category && category.communityCount > 0 ? (
                    <><br /><span style={{ color: '#ef4444', fontWeight: '600' }}>
                      현재 {category.communityCount}개의 모임이 이 카테고리를 사용 중입니다.
                    </span></>
                  ) : null;
                })()}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalButtonSecondary}
                onClick={() => setShowCategoryDeleteModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalButtonPrimary}
                onClick={handleDeleteCategory}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className={styles.toast}>
          <p>{toastMessage}</p>
        </div>
      )}
      </div>
    </DndProvider>
  );
}