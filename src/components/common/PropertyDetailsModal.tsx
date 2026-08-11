import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PanoramaViewer } from './PanoramaViewer';
import { 
  Building2, X, MapPin, CheckCircle2, ShieldCheck, 
  MessageSquare, Star, Layers, Heart, Phone, Calendar, Clock, AlertCircle, Send, ExternalLink
} from 'lucide-react';
import type { Property, PropertyReview, VisitRequest } from '../../types';
import { DEFAULT_PROPERTY_IMAGE } from '../../firebase/propertyService';

interface Props {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Checks if a specific visit time slot on a given date is in the past compared to local device time.
 */
export function isVisitSlotInPast(dateStr: string, slotStr: string): boolean {
  if (!dateStr || !slotStr) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  // Same day: parse slot time
  const parts = slotStr.trim().split(' ');
  if (parts.length < 2) return false;
  const timePart = parts[0];
  const modifier = parts[1].toUpperCase();

  const [hStr, mStr] = timePart.split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  return slotDate.getTime() <= now.getTime();
}

export function PropertyDetailsModal({ property, isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { 
    user, 
    interestedStudentsList, 
    toggleInterestedStudent, 
    recordPropertyViewLog, 
    startConversation, 
    addVisitRequest,
    addPropertyReview
  } = useStore();
  
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  // Request Visit Modal State
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState(todayStr);
  const [visitTime, setVisitTime] = useState('10:00 AM');
  const [visitError, setVisitError] = useState<string | null>(null);
  const [visitSuccess, setVisitSuccess] = useState(false);

  // Student Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const availableTimeSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

  // Automatically adjust selected visit time when date changes or modal opens
  useEffect(() => {
    if (showVisitModal) {
      setVisitError(null);
      if (!visitDate || visitDate < todayStr) {
        setVisitDate(todayStr);
      }
      
      // If current selected slot is in the past for the chosen date, pick first available future slot
      if (isVisitSlotInPast(visitDate || todayStr, visitTime)) {
        const nextValidSlot = availableTimeSlots.find((slot) => !isVisitSlotInPast(visitDate || todayStr, slot));
        if (nextValidSlot) {
          setVisitTime(nextValidSlot);
        }
      }
    }
  }, [showVisitModal, visitDate]);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [property?.id, isOpen]);

  useEffect(() => {
    if (isOpen && property && user) {
      if (user.role === 'STUDENT') {
        recordPropertyViewLog(property.id, user);
      }

      const isInterestedInStore = interestedStudentsList.some(
        (s) => s.propertyId === property.id && s.studentId === user.id
      );
      const interestedInProp = (property.interestedStudents || []).some((s) => s.studentId === user.id);
      setHasExpressedInterest(isInterestedInStore || interestedInProp);
    }
  }, [isOpen, property, user, interestedStudentsList]);

  if (!isOpen || !property) return null;

  const safeImages = Array.isArray(property.images)
    ? property.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:'))
    : [];
  const images = safeImages.length > 0 ? safeImages : [DEFAULT_PROPERTY_IMAGE];

  // Dynamic Rating calculation from stored reviews
  const reviews: PropertyReview[] = Array.isArray(property.reviews) ? property.reviews : [];
  const hasReviews = reviews.length > 0;
  const computedRating = hasReviews
    ? Math.round((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length) * 10) / 10
    : (typeof property.rating === 'number' && property.rating > 0 ? property.rating : null);
  const reviewsCount = hasReviews ? reviews.length : (property.reviewsCount || 0);

  const pricing = property.pricing || {
    monthlyRent: property.price,
    securityDeposit: property.price * 2,
    maintenanceFee: 500,
    electricityCharges: 'As per meter',
    waterCharges: 'Included',
    parkingCharges: 300,
    extraCharges: 0,
    estimatedTotal: property.price + 500 + 300,
  };

  const ownerPhone = property.ownerPhone || '7842384450';
  const cleanPhone = ownerPhone.replace(/\D/g, '');
  const telLink = `tel:${cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`}`;

  const handleExpressInterest = async () => {
    if (!user) {
      alert('Please sign in as a Student to express interest.');
      return;
    }
    if (user.role === 'OWNER') {
      alert('Property Owners cannot express interest in listings.');
      return;
    }

    const isNowInterested = await toggleInterestedStudent(property, user);
    setHasExpressedInterest(isNowInterested);
  };

  const handleMessageOwner = () => {
    if (!user) {
      alert('Please sign in as a Student to message property owners.');
      return;
    }

    if (user.role === 'OWNER') {
      alert('Only students can message property owners.');
      return;
    }

    const chatId = startConversation(
      property.id,
      property.title || 'Accommodation Inquiry',
      property.ownerId || 'owner-default',
      property.ownerName || 'Property Owner',
      user
    );

    onClose();
    navigate(`/chat/${chatId}`);
  };

  // Requirement: Request Visit Submission with strict past date/time validation
  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitError(null);

    if (!user) {
      setVisitError('Please sign in to schedule a visit.');
      return;
    }

    if (!visitDate) {
      setVisitError('Please select a valid visit date.');
      return;
    }

    // Reject past dates or past time slots
    if (visitDate < todayStr || isVisitSlotInPast(visitDate, visitTime)) {
      setVisitError('Please select a future date and time for the visit.');
      return;
    }

    const newVisit: VisitRequest = {
      id: `visit-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyName: property.title,
      propertyAddress: property.fullAddress || property.location || '',
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email || '',
      studentPhone: user.phone || '',
      studentAvatar: user.avatar,
      studentCollege: user.college || 'SIMATS Engineering',
      ownerId: property.ownerId,
      requestedDate: visitDate,
      visitDate: visitDate,
      requestedTime: visitTime,
      visitTime: visitTime,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    addVisitRequest(newVisit);
    setVisitSuccess(true);

    setTimeout(() => {
      setVisitSuccess(false);
      setShowVisitModal(false);
    }, 1800);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'STUDENT') return;
    if (reviewRating < 1 || reviewRating > 5) return;

    setIsSubmittingReview(true);
    try {
      const newRev: PropertyReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        propertyId: property.id,
        studentId: user.id,
        studentName: user.name || 'Student Resident',
        studentAvatar: user.avatar,
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      await addPropertyReview(property.id, newRev);
      setReviewComment('');
      setShowReviewForm(false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] max-h-[92dvh] flex flex-col border border-gray-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 sm:p-5 text-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white line-clamp-1">{property.title}</h2>
                <div className="flex items-center gap-2 text-xs text-primary-100 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.collegeNearby || property.location}
                  </span>
                  <span>•</span>
                  {computedRating ? (
                    <span className="flex items-center gap-1 text-yellow-300 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {computedRating.toFixed(1)} ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                    </span>
                  ) : (
                    <span className="text-primary-100 text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                      New Listing • No reviews yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Expressed Interest Banner */}
            {hasExpressedInterest && (
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>You expressed interest in this property! The owner has been notified.</span>
              </div>
            )}

            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 relative shadow-sm">
                <img
                  src={images[selectedImageIdx] || images[0] || DEFAULT_PROPERTY_IMAGE}
                  alt={property.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== DEFAULT_PROPERTY_IMAGE) {
                      target.src = DEFAULT_PROPERTY_IMAGE;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span>Owner Verified Listing</span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImageIdx === idx ? 'border-primary-500 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`} 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== DEFAULT_PROPERTY_IMAGE) {
                            target.src = DEFAULT_PROPERTY_IMAGE;
                          }
                        }}
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 360 Degree Virtual Tour */}
            {Boolean(property.panorama360Url && typeof property.panorama360Url === 'string' && property.panorama360Url.trim().length > 0) && (
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary-500" />
                  Interactive 360° Virtual Home Tour
                </h3>
                <PanoramaViewer imageUrl={property.panorama360Url.trim()} title={property.title} />
              </div>
            )}

            {/* Complete Pricing Breakdown */}
            <div className="bg-primary-50/60 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-primary-100 dark:border-primary-900/50">
                <div>
                  <span className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wider">Transparent Cost Breakdown</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rent &amp; Additional Fee Details</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">₹{pricing.monthlyRent.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"> / month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Security Deposit</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{pricing.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Maintenance Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{pricing.maintenanceFee} /mo</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Electricity</span>
                  <span className="font-bold text-gray-900 dark:text-white">{pricing.electricityCharges}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Water Charges</span>
                  <span className="font-bold text-gray-900 dark:text-white">{pricing.waterCharges}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Parking Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{pricing.parkingCharges}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
                  <span className="text-gray-500 dark:text-gray-400 block">Est. Monthly Total</span>
                  <span className="font-black text-primary-600 dark:text-primary-400">₹{pricing.estimatedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">Included Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Location & Google Maps Link */}
            <div className="bg-gray-50/80 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    Property Location
                  </h3>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 break-words">
                    {property.fullAddress || property.location || property.collegeNearby || 'Location details available on request'}
                  </p>
                  {Boolean(property.collegeNearby && property.fullAddress && property.fullAddress !== property.collegeNearby) && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                      Near {property.collegeNearby}
                    </p>
                  )}
                </div>

                {(() => {
                  const rawMap = (property.googleMapUrl || property.googleMapsUrl || '').trim();
                  const isValid = Boolean(
                    rawMap && 
                    !rawMap.startsWith('blob:') && 
                    (rawMap.startsWith('http://') || rawMap.startsWith('https://') || rawMap.includes('maps.google') || rawMap.includes('goo.gl'))
                  );
                  const formattedMapUrl = isValid && !rawMap.startsWith('http') ? `https://${rawMap}` : rawMap;

                  return isValid ? (
                    <a
                      href={formattedMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0 cursor-pointer"
                    >
                      <span>View Location on Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 italic bg-gray-100 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                      Location link not available
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Description</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
            </div>

            {/* Student Reviews & Ratings Section */}
            <div className="bg-gray-50/80 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700 space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-slate-700/60">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    Student Reviews &amp; Ratings
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasReviews ? `${reviewsCount} verified student ${reviewsCount === 1 ? 'review' : 'reviews'}` : 'No reviews yet for this listing'}
                  </p>
                </div>
                {user?.role === 'STUDENT' && (
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-1.5 rounded-lg border border-primary-200/60 dark:border-primary-800/60"
                  >
                    {showReviewForm ? 'Cancel Review' : '+ Write Review'}
                  </button>
                )}
              </div>

              {/* Interactive Student Review Form */}
              {showReviewForm && user?.role === 'STUDENT' && (
                <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-primary-200 dark:border-primary-800/70 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Star Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 rounded-md hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              star <= reviewRating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2 self-center">
                        {reviewRating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Review Comments</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your stay experience, room condition, landlord responsiveness..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}

              {/* Reviews List */}
              {hasReviews ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-700/70 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{rev.studentName}</span>
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/40 px-1.5 py-0.5 rounded text-[11px] font-bold text-yellow-700 dark:text-yellow-300">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {rev.rating}.0
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{rev.comment}</p>
                      )}
                      <span className="text-[10px] text-gray-400 block">{rev.createdAt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  This property is newly listed and has no student reviews yet.
                </p>
              )}
            </div>

            {/* Owner Info & Verified Badge */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-bold text-base uppercase">
                  {property.ownerName?.[0] || 'O'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    {property.ownerName || 'Property Owner'}
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">+91 {ownerPhone}</span>
                </div>
              </div>
            </div>

            {/* Estimated Total Rent & Action Buttons Block (Sequential in Scrollable Flow) */}
            <div className="bg-gradient-to-br from-primary-50 to-indigo-50/40 dark:from-slate-850 dark:to-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-primary-100 dark:border-slate-700 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estimated Total Rent</span>
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    ₹{pricing.estimatedTotal.toLocaleString()}
                    <span className="text-xs text-gray-400 font-normal"> / month</span>
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  All Inclusive Est.
                </span>
              </div>

              {user?.role === 'STUDENT' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* I'm Interested Button */}
                  <Button
                    onClick={handleExpressInterest}
                    className={`w-full py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
                      hasExpressedInterest
                        ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800 hover:bg-green-200'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                    }`}
                  >
                    {hasExpressedInterest ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ✔ Interested Expressed
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        I'm Interested
                      </>
                    )}
                  </Button>

                  {/* Request Visit Button */}
                  <Button
                    onClick={() => setShowVisitModal(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Request Visit
                  </Button>

                  {/* Message Owner Button */}
                  <Button
                    onClick={handleMessageOwner}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Owner
                  </Button>

                  {/* Call Owner Button */}
                  <a
                    href={telLink}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center"
                  >
                    <Phone className="w-4 h-4" />
                    Call Owner
                  </a>
                </div>
              ) : (
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 p-3 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                  Owner Preview Mode
                </div>
              )}
            </div>

            {/* Generous bottom clearance padding inside scrollable body so all action buttons are 100% visible and accessible */}
            <div className="h-6 sm:h-8 w-full flex-shrink-0" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Request Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 relative border border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowVisitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Property Visit</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select date and future time slot to visit {property.title}</p>
            </div>

            {visitSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-bold rounded-2xl text-center">
                🎉 Visit request sent to owner!
              </div>
            )}

            {visitError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{visitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVisit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> Select Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={visitDate}
                  onChange={(e) => {
                    setVisitDate(e.target.value);
                    setVisitError(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 font-semibold text-gray-900 dark:text-white"
                />
                {visitDate === todayStr && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">
                    Visiting today: past time slots are automatically disabled.
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const isPast = isVisitSlotInPast(visitDate || todayStr, slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setVisitTime(slot);
                          setVisitError(null);
                        }}
                        title={isPast ? 'This time slot has already passed' : `Select ${slot}`}
                        className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                          isPast
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-slate-800/40 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-800 line-through'
                            : visitTime === slot
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowVisitModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold">
                  Submit Visit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;
}
