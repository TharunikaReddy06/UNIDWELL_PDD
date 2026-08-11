import { useState } from 'react';
import { useStore } from '../store/useStore';
import { RoommateCard } from '../components/roommate/RoommateCard';
import { Button } from '../components/ui/Button';
import CreateRoommatePostModal from '../components/roommate/CreateRoommatePostModal';
import { Search, Plus, Building2, Users, Edit3 } from 'lucide-react';
import type { RoommatePost } from '../types';

export default function RoommatesHome() {
  const { user, roommatePosts } = useStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'HAVE_ROOM' | 'NEED_ROOM' | 'MY_POSTS'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<RoommatePost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const studentCollege = user?.college || 'SIMATS School of Engineering';

  // Requirement 2 & 3: Real Roommate Posts & My Roommate Posts Filter
  const filteredPosts = roommatePosts.filter(post => {
    let matchesTab = true;

    if (activeTab === 'HAVE_ROOM') matchesTab = post.type === 'LOOKING_FOR_ROOMMATE';
    if (activeTab === 'NEED_ROOM') matchesTab = post.type === 'LOOKING_FOR_ROOM';
    if (activeTab === 'MY_POSTS') matchesTab = post.authorId === user?.id;

    const matchesSearch =
      !searchQuery.trim() ||
      post.aboutMe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.preferredLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.lifestyleTags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsCreateOpen(true);
  };

  const handleEditPost = (post: RoommatePost) => {
    setEditingPost(post);
    setIsCreateOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-h-0 bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-white pb-24 relative transition-colors duration-150">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 space-y-3 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Roommates</h1>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              {studentCollege}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search location, tags (e.g. Poonamallee, Studious)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tabs: All Matches, Have a Room, Need a Room, My Posts */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL' ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('HAVE_ROOM')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'HAVE_ROOM' ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Have Room
          </button>
          <button 
            onClick={() => setActiveTab('NEED_ROOM')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'NEED_ROOM' ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Need Room
          </button>
          <button 
            onClick={() => setActiveTab('MY_POSTS')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'MY_POSTS' ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs font-black' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Edit3 className="w-3 h-3 text-primary-600 dark:text-primary-400" />
            My Posts
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 pt-6 space-y-4">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
          Showing {filteredPosts.length} roommate requests near <span className="font-extrabold text-gray-800 dark:text-gray-200">{studentCollege}</span>
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map(post => (
            <RoommateCard key={post.id} post={post} onEdit={handleEditPost} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm space-y-2 max-w-md mx-auto my-8">
            <Users className="w-12 h-12 text-primary-400 mx-auto mb-1 opacity-50" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {activeTab === 'MY_POSTS' ? "You haven't posted any roommate requests yet" : 'No roommate requests found'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
              {activeTab === 'MY_POSTS'
                ? 'Create your roommate requirement to connect with compatible students.'
                : 'Be the first student to post a roommate requirement near campus!'}
            </p>
            <Button onClick={handleOpenCreate} className="bg-primary-600 text-white text-xs border-none font-bold">
              <Plus className="w-4 h-4 mr-1" /> Create Roommate Post
            </Button>
          </div>
        )}
      </div>

      {/* FAB - Create Post */}
      <div className="fixed bottom-20 right-6 z-40">
        <Button
          onClick={handleOpenCreate}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl p-0 flex items-center justify-center hover:scale-105 transition-all border-2 border-white dark:border-slate-800"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Create / Edit Roommate Request Modal */}
      <CreateRoommatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        postToEdit={editingPost}
      />
    </div>
  );
}
