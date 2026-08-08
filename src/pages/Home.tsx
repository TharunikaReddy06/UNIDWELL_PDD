import { useState } from 'react';
import { useStore } from '../store/useStore';
import { PropertyCard } from '../components/common/PropertyCard';
import { PropertyDetailsModal } from '../components/common/PropertyDetailsModal';
import NotificationsModal from '../components/common/NotificationsModal';
import FilterModal from '../components/common/FilterModal';
import { Search, SlidersHorizontal, MapPin, Building2, Home as HomeIcon, Bell } from 'lucide-react';
import { Input } from '../components/ui/Input';
import type { Property } from '../types';

export default function Home() {
  const { user, properties, notifications, visitRequests } = useStore();
  const myVisitRequests = visitRequests.filter((r) => r.studentId === user?.id);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Advanced Filters State
  const [filterCollege, setFilterCollege] = useState('');
  const [filterMaxRent, setFilterMaxRent] = useState(30000);
  const [filterRoomType, setFilterRoomType] = useState('All');
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);

  const categories = ['All', 'Single Room', 'Shared Room', 'Apartment', 'PG'];
  const studentCollege = user?.college || 'SIMATS School of Engineering';

  // Count unread notifications for current student
  const userNotifs = notifications.filter((n) => n.userId === user?.id);
  const unreadNotifsCount = userNotifs.filter((n) => !(n.isRead ?? n.read)).length;

  // Student Dashboard displays ONLY properties where status == "available" and available == true
  const filteredProperties = properties.filter((p) => {
    const isAvailableStatus = (p.status === 'available' || p.status === 'Published' || p.status === 'Active' || !p.status) && p.available !== false && p.status !== 'rented' && p.status !== 'Rented';

    if (!isAvailableStatus) return false;

    
    // Quick Category match
    const matchesCat =
      activeCategory === 'All' ||
      p.type === activeCategory ||
      (activeCategory === 'Single Room' && (p.type === 'PRIVATE' || p.type === 'Single Room')) ||
      (activeCategory === 'Shared Room' && (p.type === 'SHARED' || p.type === 'Shared Room'));

    // Modal Room Type match
    const matchesModalType =
      filterRoomType === 'All' ||
      p.type === filterRoomType ||
      (filterRoomType === 'Single Room' && (p.type === 'PRIVATE' || p.type === 'Single Room')) ||
      (filterRoomType === 'Shared Room' && (p.type === 'SHARED' || p.type === 'Shared Room'));

    // Rent match
    const matchesRent = p.price <= filterMaxRent;

    // Search match
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.collegeNearby?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollege =
      !filterCollege.trim() ||
      p.collegeNearby?.toLowerCase().includes(filterCollege.toLowerCase()) ||
      p.location.toLowerCase().includes(filterCollege.toLowerCase());

    // Amenities match
    const matchesAmenities =
      filterAmenities.length === 0 ||
      filterAmenities.every((amenity) => (p.amenities || []).includes(amenity));

    return matchesCat && matchesModalType && matchesRent && matchesSearch && matchesCollege && matchesAmenities;
  });

  const handleCardClick = (p: Property) => {
    setSelectedProperty(p);
    setIsDetailsOpen(true);
  };

  const handleApplyFilters = (filters: {
    college: string;
    location: string;
    maxRent: number;
    roomType: string;
    selectedAmenities: string[];
  }) => {
    setFilterCollege(filters.college);
    setFilterMaxRent(filters.maxRent);
    setFilterRoomType(filters.roomType);
    setFilterAmenities(filters.selectedAmenities);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-gray-100 pb-20 transition-colors duration-150">
      {/* Header section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-primary-100 text-xs font-medium mb-1 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Campus Location
            </p>
            <div className="flex items-center text-white font-bold text-base sm:text-lg gap-1.5 leading-tight max-w-[240px] sm:max-w-xs truncate">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{studentCollege}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Icon */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white relative transition-all border border-white/30 backdrop-blur-sm"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold overflow-hidden border border-white/30 uppercase">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover"/>
              ) : (
                <span>{user?.name?.[0] || 'S'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar & Filter Drawer Button */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input 
              icon={<Search className="w-5 h-5 text-gray-400" />}
              placeholder={`Search rooms near ${studentCollege}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/95 dark:bg-slate-850 dark:text-white border-0 shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="bg-secondary-500 p-3 rounded-xl text-white shadow-sm hover:bg-secondary-600 transition-colors flex items-center justify-center"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className="flex-1 px-6 pt-6 overflow-y-auto">
        
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Real-Time Student Visit Requests Tracker */}
        {myVisitRequests.length > 0 && (
          <div className="mb-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" /> My Visit Requests Status
              </h3>
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full">
                Real-Time Updates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {myVisitRequests.map((req) => {
                const isPending = req.status === 'PENDING' || req.status === 'Pending';
                const isAccepted = req.status === 'ACCEPTED' || req.status === 'Accepted';
                const isRejected = req.status === 'REJECTED' || req.status === 'Rejected';

                return (
                  <div key={req.id || req.requestId} className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[180px]">
                        {req.propertyTitle || req.propertyName}
                      </h4>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                        isAccepted ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300' :
                        isRejected ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300' :
                        'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Date: <span className="font-semibold text-gray-800 dark:text-gray-200">{req.requestedDate || req.visitDate}</span> • Time: <span className="font-semibold text-gray-800 dark:text-gray-200">{req.requestedTime || req.visitTime}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State check when no owner has published properties */}
        {filteredProperties.length === 0 ? (
          <div className="my-12 text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No properties available.</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              No published accommodations match your current search filters or college location. Try resetting your search!
            </p>
          </div>
        ) : (
          <>
            {/* Nearby Properties Grid */}
            <div className="mt-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                    Verified Rooms near {studentCollege}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Real published student accommodations</p>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{filteredProperties.length} Available</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onClick={() => handleCardClick(property)}
                  />
                ))}
              </div>
            </div>
            
            {/* All Listings Feed */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">All Available Accommodations</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Live listings published by verified property owners</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard 
                    key={`feed-${property.id}`} 
                    property={property} 
                    onClick={() => handleCardClick(property)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

      </div>


      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      {/* Filter Modal Drawer */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCollege={studentCollege}
        onApplyFilters={handleApplyFilters}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
