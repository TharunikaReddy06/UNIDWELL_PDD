import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { AddPropertyModal } from '../components/owner/AddPropertyModal';
import { PropertyDetailsModal } from '../components/common/PropertyDetailsModal';
import PropertyAnalyticsModal from '../components/owner/PropertyAnalyticsModal';
import { Building2, Plus, Eye, Users, Trash2, AlertTriangle } from 'lucide-react';
import type { Property } from '../types';
import { DEFAULT_PROPERTY_IMAGE } from '../firebase/propertyService';

export default function OwnerProperties() {
  const { user, properties, propertyViews, interestedStudentsList, updateProperty, deleteProperty } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Property Analytics Modal State
  const [analyticsProperty, setAnalyticsProperty] = useState<Property | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Status Change Confirmation Modal State
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    isOpen: boolean;
    property: Property | null;
    targetStatus: 'Draft' | 'Published' | 'Rented' | 'Inactive';
  }>({
    isOpen: false,
    property: null,
    targetStatus: 'Published',
  });

  // Deduplicate owner properties by ID so each property appears ONLY ONCE
  const rawOwnerProperties = properties.filter((p) => p.ownerId === user?.id);
  const ownerProperties = Array.from(new Map(rawOwnerProperties.map((p) => [p.id, p])).values());
  const hasProperties = ownerProperties.length > 0;

  const handleRequestStatusChange = (
    property: Property,
    targetStatus: 'Draft' | 'Published' | 'Rented' | 'Inactive'
  ) => {
    if (property.status === targetStatus) return;
    setConfirmStatusModal({
      isOpen: true,
      property,
      targetStatus,
    });
  };

  const handleConfirmStatusChange = () => {
    const { property, targetStatus } = confirmStatusModal;
    if (property) {
      updateProperty(property.id, {
        status: targetStatus,
        available: targetStatus === 'Published',
      });
    }
    setConfirmStatusModal({ isOpen: false, property: null, targetStatus: 'Published' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property listing?')) {
      deleteProperty(id);
    }
  };

  const handleOpenDetails = (p: Property) => {
    setSelectedProperty(p);
    setIsDetailsOpen(true);
  };

  const handleOpenAnalytics = (p: Property) => {
    setAnalyticsProperty(p);
    setIsAnalyticsOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-w-0 bg-[var(--bg-primary)] dark:bg-[#0B1320] text-gray-900 dark:text-white pb-20 relative space-y-6 transition-colors duration-150">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap w-full">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Properties</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Properties published by you ({ownerProperties.length})</p>
          </div>
          {/* Rule: Show ONLY ONE "Add New Property" button at the top when owner ALREADY has properties */}
          {hasProperties && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white border-none shadow-md text-xs font-bold flex items-center gap-1.5 py-2.5 px-4 rounded-xl flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Property
            </Button>
          )}
        </div>

        {!hasProperties ? (
          /* Rule: When owner has NO properties, display empty state with ONLY ONE + Add Property button */
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm max-w-lg mx-auto w-full">
            <Building2 className="w-16 h-16 text-secondary-400 mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">No properties created yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Create and publish your first rental property for students.</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-secondary-600 text-white border-none text-xs font-bold px-6 py-2.5 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Property
            </Button>
          </div>
        ) : (
          /* Responsive Grid: 1 col on mobile, 2 cols on laptop (900-1599px), 3 cols on large desktop (>=1600px) */
          <div className="grid grid-cols-1 min-[900px]:grid-cols-2 min-[1600px]:grid-cols-3 gap-6 w-full">

            {ownerProperties.map((property) => {
              // Calculate property-specific views and interested students from Firestore state in useStore
              const propInterestedRecords = (interestedStudentsList || []).filter((s) => s.propertyId === property.id);
              const interestedCount = propInterestedRecords.length || (property.interestedStudents || []).length || 0;

              const propViewRecords = (propertyViews || []).filter((v) => v.propertyId === property.id);
              const viewCount = propViewRecords.length || (property.viewLogs || []).length || property.viewsCount || 0;
              const currentStatus = property.status || 'Published';

              return (
                <div
                  key={property.id}
                  className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-md flex flex-col box-border"
                >
                  {/* Property Image with 16/10 aspect ratio */}
                  <div className="aspect-[16/10] w-full bg-gray-100 dark:bg-slate-800 relative overflow-hidden flex-shrink-0">
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
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[calc(100%-24px)]">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full backdrop-blur-md shadow-sm uppercase ${
                          currentStatus === 'Published'
                            ? 'bg-green-500 text-white'
                            : currentStatus === 'Rented'
                            ? 'bg-purple-600 text-white'
                            : currentStatus === 'Draft'
                            ? 'bg-amber-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        ● {currentStatus}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {property.type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-secondary-600 text-white text-base font-extrabold px-3 py-1 rounded-xl shadow-md max-w-[calc(100%-24px)] truncate">
                      ₹{property.price.toLocaleString()}/mo
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0 w-full">
                    <div className="min-w-0 w-full">
                      {/* Property Title with natural wrapping */}
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1 break-words [overflow-wrap:anywhere]">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3 break-words">
                        <Building2 className="w-3.5 h-3.5 text-secondary-500 flex-shrink-0" />
                        <span className="truncate">{property.collegeNearby || property.location}</span>
                      </p>

                      {/* Property Status Controls with Wrapping */}
                      <div className="bg-gray-50 dark:bg-slate-800/90 p-3 rounded-2xl border border-gray-100 dark:border-slate-700/60 mb-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Status:</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300">
                            ● {currentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap w-full">
                          {(['Published', 'Rented', 'Draft', 'Inactive'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleRequestStatusChange(property, st)}
                              className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border text-center whitespace-nowrap ${
                                currentStatus === st
                                  ? 'bg-secondary-600 text-white border-secondary-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2-Column Responsive Stats Grid for Unique Views & Interested Students */}
                      <div className="grid grid-cols-2 gap-3 pt-2 pb-1 border-t border-gray-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleOpenAnalytics(property)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors text-center min-w-0"
                        >
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base">
                            <Eye className="w-4 h-4 flex-shrink-0" />
                            <span>{viewCount}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mt-0.5 leading-tight break-words text-center">
                            Unique Views
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAnalytics(property)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/80 dark:border-purple-900/30 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 transition-colors text-center min-w-0"
                        >
                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-black text-sm sm:text-base">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>{interestedCount}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mt-0.5 leading-tight break-words text-center">
                            Interested Students
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 3-Column Responsive Action Buttons Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(property)}
                        className="w-full min-w-0 text-[11px] border-secondary-200 dark:border-secondary-900 text-secondary-700 dark:text-secondary-300 font-bold py-2 px-1 flex items-center justify-center gap-1 text-center whitespace-normal leading-tight h-auto"
                      >
                        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">View Listing</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAnalytics(property)}
                        className="w-full min-w-0 text-[11px] border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-bold py-2 px-1 flex items-center justify-center gap-1 text-center whitespace-normal leading-tight h-auto"
                      >
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Viewing List ({viewCount})</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        className="w-full min-w-0 text-[11px] text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold py-2 px-1 flex items-center justify-center gap-1 text-center whitespace-normal leading-tight h-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal for Property Status Change */}
      {confirmStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-4 text-center relative border border-gray-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1">Confirm Status Change</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Are you sure you want to mark this property as <span className="font-extrabold text-secondary-600 dark:text-secondary-400 uppercase">{confirmStatusModal.targetStatus}</span>?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setConfirmStatusModal({ isOpen: false, property: null, targetStatus: 'Published' })}
                className="text-xs font-bold border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleConfirmStatusChange}
                className="bg-secondary-600 hover:bg-secondary-700 text-white border-none text-xs font-bold"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Multi-Step Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {}}
      />

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <PropertyAnalyticsModal
        property={analyticsProperty}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
}
