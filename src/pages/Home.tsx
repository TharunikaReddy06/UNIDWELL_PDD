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
    <div className="flex flex-col w-full min-h-0 space-y-4 sm:space-y-6 pb-6 transition-colors duration-150">
      {/* Campus Location Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm text-white space-y-3 sm:space-y-4">
        <div>
          <p className="text-primary-100 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            Campus Location
          </p>
          <div className="flex items-center text-white font-extrabold text-base sm:text-lg gap-2 leading-snug">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary-200" />
            <span className="break-words">{studentCollege}</span>
          </div>
        </div>

        {/* Search Bar & Filter Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                placeholder={`Search rooms near ${studentCollege}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-850 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-200 border-0 shadow-inner h-10 sm:h-11"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="bg-secondary-500 hover:bg-secondary-600 active:scale-95 text-white h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm transition-all cursor-pointer"
            title="Filter Options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button 
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
              activeCategory === cat 
                ? 'bg-primary-600 text-white shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Real-Time Student Visit Requests Tracker */}
      {myVisitRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" /> My Visit Requests Status
            </h3>
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full">
              Real-Time Updates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-48 overflow-y-auto pr-1">
            {myVisitRequests.map((req) => {
              const isPending = req.status === 'PENDING' || req.status === 'Pending';
              const isAccepted = req.status === 'ACCEPTED' || req.status === 'Accepted';
              const isRejected = req.status === 'REJECTED' || req.status === 'Rejected';

              return (
                <div key={req.id || req.requestId} className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 space-y-1">
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

      {/* Empty State check when no properties match */}
      {filteredProperties.length === 0 ? (
        <div className="my-6 sm:my-12 text-center py-10 sm:py-12 px-4 sm:px-6 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <HomeIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">No properties available.</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            No published accommodations match your current search filters or college location. Try resetting your search!
          </p>
        </div>
      ) : (
        <>
          {/* Nearby Properties Grid */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Verified Rooms near {studentCollege}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Real published student accommodations</p>
              </div>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 self-start sm:self-auto bg-primary-50 dark:bg-primary-950/50 px-2.5 py-0.5 rounded-full">
                {filteredProperties.length} Available
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white mb-0.5">All Available Accommodations</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live listings published by verified property owners</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
