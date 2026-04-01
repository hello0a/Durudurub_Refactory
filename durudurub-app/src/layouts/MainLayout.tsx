import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { SearchModal } from '@/components/modal/SearchModal';
import { useApp } from '@/contexts/AppContext';
import { mockCommunities } from '@/data/mockCommunities';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleCommunityClickFromSearch = (communityId: string) => {
    const community = mockCommunities.find((c) => c.id === communityId);
    if (community) {
      navigate(`/community/${communityId}`);
    }
    setIsSearchModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        <Outlet context={{ setIsSearchModalOpen }} />
      </main>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={(query) => {
          navigate(`/explore?q=${encodeURIComponent(query)}`);
          setIsSearchModalOpen(false);
        }}
        user={user}
        communities={mockCommunities}
        onCommunityClick={handleCommunityClickFromSearch}
        onPaymentClick={() => {
          setIsSearchModalOpen(false);
          navigate('/payment');
        }}
      />
    </div>
  );
}