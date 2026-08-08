import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PanoramaViewer } from './PanoramaViewer';
import { 
  Building2, X, MapPin, CheckCircle2, ShieldCheck, 
  MessageSquare, Star, Layers, Heart, Phone, Calendar, Clock
} from 'lucide-react';
import type { Property, VisitRequest } from '../../types';

interface Props {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDetailsModal({ property, isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { 
    user, 
    interestedStudentsList, 
    toggleInterestedStudent, 
    recordPropertyViewLog, 
    startConversation, 
    addVisitRequest 
  } = useStore();
  
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  // Request Visit Modal State
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00 AM');
  const [visitSuccess, setVisitSuccess] = useState(false);

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

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'];

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
      property.title,
      property.ownerId || 'owner-default',
      property.ownerName || 'Property Owner',
      user
    );

    onClose();
    navigate(`/chat/${chatId}`);
  };

  // Requirement 10: Request Visit Submission
  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !visitDate) return;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col border border-gray-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-5 text-white flex justify-between items-center flex-shrink-0">
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
                  <span className="flex items-center gap-1 text-yellow-300 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {property.rating || 4.8}
                  </span>
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
                  src={images[selectedImageIdx]}
                  alt={property.title}
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
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 360 Degree Virtual Tour */}
            {property.panorama360Url && (
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary-500" />
                  Interactive 360° Virtual Home Tour
                </h3>
                <PanoramaViewer imageUrl={property.panorama360Url} title={property.title} />
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

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Description</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
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
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 gap-2 flex-wrap">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Est. Total Rent</span>
              <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400">₹{pricing.estimatedTotal.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
            </div>

            {user?.role === 'STUDENT' ? (
              <div className="flex gap-2 flex-wrap items-center">
                {/* I'm Interested Button */}
                <Button
                  onClick={handleExpressInterest}
                  className={`text-xs font-bold px-3 py-2 flex items-center gap-1.5 transition-all ${
                    hasExpressedInterest
                      ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800 hover:bg-green-200'
                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                  }`}
                >
                  {hasExpressedInterest ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ✔ Interested
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      I'm Interested
                    </>
                  )}
                </Button>

                {/* Request Visit Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowVisitModal(true)}
                  className="border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold flex items-center gap-1 py-2 px-3"
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Request Visit
                </Button>

                {/* Call Owner Button */}
                <a
                  href={telLink}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Owner
                </a>

                {/* Message Owner Button */}
                <Button
                  onClick={handleMessageOwner}
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white border-none shadow-md text-xs font-bold px-3.5 py-2 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Owner
                </Button>
              </div>
            ) : (
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                Owner Preview Mode
              </div>
            )}
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Select date and time slot to visit {property.title}</p>
            </div>

            {visitSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-bold rounded-2xl text-center">
                🎉 Visit request sent to owner!
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
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 font-semibold text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['10:00 AM', '02:00 PM', '05:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setVisitTime(slot)}
                      className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                        visitTime === slot
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
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
    </div>
  );
}
