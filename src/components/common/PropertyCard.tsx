import type { Property } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MapPin, Star, Compass, ShieldCheck, Heart, Eye, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DEFAULT_PROPERTY_IMAGE } from '../../firebase/propertyService';

interface Props {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<Props> = ({ property, onClick }) => {
  const { user, savedProperties, toggleSavedProperty, propertyViews, interestedStudentsList } = useStore();

  const isSaved = savedProperties.includes(property.id);

  // Compute real-time unique views & interested counts from Firestore snapshot states
  const uniqueViewsCount = (propertyViews || []).filter((v) => v.propertyId === property.id).length || property.viewsCount || 0;
  const uniqueInterestedCount = (interestedStudentsList || []).filter((s) => s.propertyId === property.id).length || (property.interestedStudents || []).length || 0;

  const candidateImage = Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === 'string' && property.images[0].trim().length > 0 && !property.images[0].startsWith('blob:')
    ? property.images[0].trim()
    : DEFAULT_PROPERTY_IMAGE;

  const has360Tour = Boolean(
    property.panorama360Url &&
    typeof property.panorama360Url === 'string' &&
    property.panorama360Url.trim().length > 0 &&
    !property.panorama360Url.startsWith('blob:')
  );

  // Real rating calculated from property reviews or verified rating
  const hasReviews = Array.isArray(property.reviews) && property.reviews.length > 0;
  const computedRating = hasReviews
    ? Math.round((property.reviews!.reduce((acc, r) => acc + (r.rating || 5), 0) / property.reviews!.length) * 10) / 10
    : (typeof property.rating === 'number' && property.rating > 0 ? property.rating : null);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleSavedProperty(property.id);
  };

  return (
    <Card 
      onClick={onClick}
      className="w-full snap-center cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={candidateImage} 
          alt={property.title} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_PROPERTY_IMAGE) {
              target.src = DEFAULT_PROPERTY_IMAGE;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <Badge variant="primary">{property.type}</Badge>
          {has360Tour && (
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
              <Compass className="w-3 h-3 text-secondary-400" />
              360° Tour
            </span>
          )}
        </div>

        {/* Requirement 1: Save (❤️) Heart Icon Button */}
        {user?.role === 'STUDENT' && (
          <button
            type="button"
            onClick={handleToggleSave}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'
              }`}
            />
          </button>
        )}

        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary-900 dark:text-primary-100 font-extrabold text-sm px-3 py-1 rounded-xl shadow-md">
          ₹{property.price.toLocaleString()} <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">/mo</span>
        </div>
      </div>

      <CardContent>
        <div className="flex justify-between items-start mb-1.5 gap-2">
          <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {property.title}
          </h3>
          {computedRating ? (
            <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-950/40 px-1.5 py-0.5 rounded-md flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {computedRating.toFixed(1)}
            </div>
          ) : (
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">
              No reviews yet
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
          <span className="line-clamp-1">{property.collegeNearby || property.location}</span>
        </div>

        {/* Real-time Unique Views & Interested Student Counters */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50 flex items-center gap-1">
            <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            {uniqueViewsCount} Views
          </span>
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-900/50 flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            {uniqueInterestedCount} Interested
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Owner Verified
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-bold text-xs hover:underline">
            View Details & 360° →
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
