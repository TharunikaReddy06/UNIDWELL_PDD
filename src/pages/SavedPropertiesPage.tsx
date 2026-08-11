import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PropertyDetailsModal } from '../components/common/PropertyDetailsModal';
import { 
  Heart, Building2, ShieldCheck, MessageSquare, 
  Eye, Trash2, HeartOff, AlertCircle
} from 'lucide-react';
import type { Property } from '../types';
import { DEFAULT_PROPERTY_IMAGE } from '../firebase/propertyService';

export default function SavedPropertiesPage() {
  const navigate = useNavigate();
  const { user, properties, savedProperties, toggleSavedProperty, startConversation } = useStore();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter ONLY properties saved by currently logged-in student
  const savedList = properties.filter((p) => savedProperties.includes(p.id));

  const handleOpenDetails = (p: Property) => {
    setSelectedProperty(p);
    setIsDetailsOpen(true);
  };

  const handleMessageOwner = (p: Property) => {
    if (!user) return;
    const chatId = startConversation(
      p.id,
      p.title,
      p.ownerId || 'owner-default',
      p.ownerName || 'Property Owner',
      user
    );
    navigate(`/chat/${chatId}`);
  };

  const handleRemove = (id: string) => {
    toggleSavedProperty(id);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" /> Saved Properties
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your bookmarked student accommodations ({savedList.length})</p>
          </div>
        </div>

        {savedList.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm space-y-3 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <HeartOff className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">You haven't saved any properties yet.</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Tap the ❤️ Save icon on any accommodation card to bookmark rooms for quick access here.
            </p>
            <Button onClick={() => navigate('/')} className="bg-primary-600 text-white border-none text-xs font-bold mt-2">
              Explore Available Rooms
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {savedList.map((property) => {
              const pricing = property.pricing || {
                monthlyRent: property.price,
                securityDeposit: property.price * 2,
                maintenanceFee: 500,
              };

              // Section 4: Property Status check
              const isAvailable = property.status === 'Published' || (property.status === 'Active' && property.available) || (!property.status && property.available);
              const currentStatus = property.status || (isAvailable ? 'Published' : 'Rented');

              return (
                <div
                  key={property.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-md space-y-3 p-4 relative"
                >
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                    <img
                      src={
                        Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === 'string' && property.images[0].trim().length > 0 && !property.images[0].startsWith('blob:')
                          ? property.images[0].trim()
                          : DEFAULT_PROPERTY_IMAGE
                      }
                      alt={property.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== DEFAULT_PROPERTY_IMAGE) {
                          target.src = DEFAULT_PROPERTY_IMAGE;
                        }
                      }}
                      className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-80' : ''}`}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md uppercase ${
                        isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        Status: {currentStatus}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {property.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(property.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-red-500 flex items-center justify-center shadow-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove from Saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unavailable Warning Banner */}
                  {!isAvailable && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>This property is no longer available.</span>
                    </div>
                  )}

                  {/* Title & Verified Badge */}
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1">{property.title}</h3>
                      <span className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 dark:border-green-800 flex items-center gap-1 flex-shrink-0">
                        <ShieldCheck className="w-3 h-3 text-green-600" /> Owner Verified
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary-600" />
                      {property.collegeNearby || property.location}
                    </p>
                  </div>

                  {/* Rent, Advance & Maintenance Pricing Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl text-[11px] border border-gray-100 dark:border-slate-700">
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px]">Monthly Rent</span>
                      <span className="font-black text-primary-600 dark:text-primary-400 text-xs">₹{pricing.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px]">Advance</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{pricing.securityDeposit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px]">Maintenance</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{pricing.maintenanceFee}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(property)}
                      className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-bold text-xs py-1.5 px-1"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleMessageOwner(property)}
                      disabled={!isAvailable}
                      className={`font-bold text-xs border-none py-1.5 px-1 ${
                        isAvailable ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(property.id)}
                      className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs py-1.5 px-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
