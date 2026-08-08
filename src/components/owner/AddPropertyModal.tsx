import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CollegeAutocomplete } from '../ui/CollegeAutocomplete';
import { PanoramaViewer } from '../common/PanoramaViewer';
import { 
  Building2, X, CheckCircle2, UploadCloud, Trash2, 
  Sparkles, Check, ChevronRight, ChevronLeft, Edit3, Compass, Plus
} from 'lucide-react';
import type { Property } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_AMENITIES = [
  'WiFi', 'AC', 'Fan', 'Geyser', 'Washing Machine', 'Refrigerator',
  'Study Table', 'Parking', 'Power Backup', 'CCTV', 'Security', 'Attached Bathroom'
];

interface ExtraChargeItem {
  name: string;
  amount: number;
}

export function AddPropertyModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, addProperty } = useStore();

  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Step 1 State: Details
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'Single Room' | 'Shared Room' | 'Apartment' | 'PG'>('Single Room');
  const [collegeNearby, setCollegeNearby] = useState(user?.college || 'SIMATS School of Engineering');
  const [fullAddress, setFullAddress] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState('1');
  const [numberOfBeds, setNumberOfBeds] = useState('1');
  const [roomSizeSqFt, setRoomSizeSqFt] = useState('250');

  // Step 2 State: Pricing & Dynamic Extra Charges
  const [monthlyRent, setMonthlyRent] = useState('8500');
  const [securityDeposit, setSecurityDeposit] = useState('17000');
  const [extraChargesList, setExtraChargesList] = useState<ExtraChargeItem[]>([
    { name: 'Maintenance', amount: 500 },
    { name: 'Electricity', amount: 800 },
    { name: 'Water Charges', amount: 200 }
  ]);
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [showAddChargeInput, setShowAddChargeInput] = useState(false);

  // Step 3 State: Dynamic Amenities
  const [amenitiesList, setAmenitiesList] = useState<string[]>(DEFAULT_AMENITIES);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi', 'AC', 'Attached Bathroom', 'Security', 'Geyser'
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [showCustomAmenityInput, setShowCustomAmenityInput] = useState(false);

  // Step 4 State: Images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  ]);

  // Step 5 State: 360 Tour
  const [panoramaUrl, setPanoramaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80'
  );

  // Real-time Estimated Monthly Cost Calculation
  const rentVal = parseFloat(monthlyRent) || 0;
  const totalExtraCharges = extraChargesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const estimatedMonthlyCost = rentVal + totalExtraCharges;

  // Section 2: Add Custom Amenity
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!amenitiesList.includes(trimmed)) {
      setAmenitiesList((prev) => [...prev, trimmed]);
    }
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
    setShowCustomAmenityInput(false);
  };

  // Section 3: Add Extra Charge
  const handleAddExtraCharge = () => {
    const nameTrimmed = newChargeName.trim();
    const amountVal = parseFloat(newChargeAmount) || 0;
    if (!nameTrimmed || amountVal <= 0) return;

    setExtraChargesList((prev) => [...prev, { name: nameTrimmed, amount: amountVal }]);
    setNewChargeName('');
    setNewChargeAmount('');
    setShowAddChargeInput(false);
  };

  const removeExtraCharge = (index: number) => {
    setExtraChargesList((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length && images.length + newUrls.length < 10; i++) {
      newUrls.push(URL.createObjectURL(files[i]));
    }
    setImages((prev) => [...prev, ...newUrls].slice(0, 10));
  };

  const handlePanoramaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanoramaUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      ownerId: user?.id || 'owner-default',
      ownerName: user?.name || 'Rajesh Sharma',
      ownerPhone: user?.phone || '9876543210',
      title: title || `${propertyType} near ${collegeNearby}`,
      description: `Premium ${propertyType} located at ${fullAddress || collegeNearby}. Features 360° virtual tour, modern amenities, and 24/7 security.`,
      price: rentVal,
      location: fullAddress || collegeNearby,
      collegeNearby,
      fullAddress,
      googleMapUrl,
      numberOfRooms: parseInt(numberOfRooms) || 1,
      numberOfBeds: parseInt(numberOfBeds) || 1,
      roomSizeSqFt: parseInt(roomSizeSqFt) || 250,
      type: propertyType,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      amenities: selectedAmenities,
      panorama360Url: panoramaUrl,
      available: true,
      status: 'Active',
      rating: 4.9,
      viewsCount: 1,
      interestedStudentsCount: 0,
      pricing: {
        monthlyRent: rentVal,
        securityDeposit: parseFloat(securityDeposit) || rentVal * 2,
        maintenanceFee: extraChargesList.find((c) => c.name.toLowerCase() === 'maintenance')?.amount || 0,
        extraCharges: totalExtraCharges.toString(),
        extraChargesBreakdown: extraChargesList,
        estimatedTotal: estimatedMonthlyCost,
      },
    };

    addProperty(newProperty);
    setShowSuccessModal(true);
  };

  const handleFinishSuccess = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence>
        {!showSuccessModal ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col border border-gray-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 p-6 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-secondary-200" />
                  Post New Property
                </h2>
                <p className="text-xs text-secondary-100 mt-1">Step {step} of 6</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Stepper Bar */}
            <div className="bg-gray-100 dark:bg-slate-800 h-1.5 w-full flex-shrink-0">
              <div
                className="bg-secondary-500 h-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* STEP 1: Details */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 1: Property Details</h3>

                  <Input
                    label="Property Title"
                    placeholder="e.g. SIMATS Luxury Single Room PG"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Single Room', 'Shared Room', 'Apartment', 'PG'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPropertyType(t)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            propertyType === t
                              ? 'bg-secondary-50 dark:bg-secondary-950/50 border-secondary-500 text-secondary-900 dark:text-secondary-300 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CollegeAutocomplete
                    value={collegeNearby}
                    onChange={(val) => setCollegeNearby(val)}
                  />

                  <Input
                    label="Full Address"
                    placeholder="Door No, Street Name, Area, City"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                  />

                  <Input
                    label="Google Map Location URL"
                    placeholder="https://maps.google.com/..."
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="No. of Rooms"
                      type="number"
                      value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(e.target.value)}
                    />
                    <Input
                      label="No. of Beds"
                      type="number"
                      value={numberOfBeds}
                      onChange={(e) => setNumberOfBeds(e.target.value)}
                    />
                    <Input
                      label="Size (sq.ft)"
                      type="number"
                      value={roomSizeSqFt}
                      onChange={(e) => setRoomSizeSqFt(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Pricing & Dynamic Extra Charges */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 2: Pricing & Extra Charges</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Monthly Rent (₹)"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                    />
                    <Input
                      label="Security Deposit / Advance (₹)"
                      type="number"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                    />
                  </div>

                  {/* Section 3: Dynamic Extra Charges */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Extra Charges</label>
                      <button
                        type="button"
                        onClick={() => setShowAddChargeInput(true)}
                        className="text-xs font-bold text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 flex items-center gap-1 bg-secondary-50 dark:bg-secondary-950/50 px-3 py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-900"
                      >
                        <Plus className="w-4 h-4" /> Add Extra Charge
                      </button>
                    </div>

                    {/* Add Extra Charge Input Box */}
                    {showAddChargeInput && (
                      <div className="p-3.5 bg-secondary-50/70 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-900/50 rounded-2xl space-y-3">
                        <span className="text-xs font-bold text-secondary-900 dark:text-secondary-300 block">New Extra Charge</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="Charge Name (e.g. Maintenance, Electricity)"
                            value={newChargeName}
                            onChange={(e) => setNewChargeName(e.target.value)}
                          />
                          <Input
                            placeholder="Amount (₹)"
                            type="number"
                            value={newChargeAmount}
                            onChange={(e) => setNewChargeAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddChargeInput(false)}
                            className="text-xs border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddExtraCharge}
                            className="bg-secondary-600 text-white border-none text-xs font-bold"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Added Extra Charges List */}
                    <div className="space-y-2">
                      {extraChargesList.map((charge, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                        >
                          <span className="font-bold text-gray-800 dark:text-gray-200">{charge.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-secondary-700 dark:text-secondary-400">₹{charge.amount}/mo</span>
                            <button
                              type="button"
                              onClick={() => removeExtraCharge(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Estimated Cost Banner */}
                  <div className="bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200 dark:border-secondary-900/50 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-secondary-800 dark:text-secondary-300 uppercase tracking-wider">Estimated Monthly Cost</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rent (₹{rentVal}) + Extra Charges (₹{totalExtraCharges})</p>
                    </div>
                    <span className="text-2xl font-black text-secondary-700 dark:text-secondary-300">₹{estimatedMonthlyCost.toLocaleString()}/mo</span>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Dynamic Amenities */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 3: Select Amenities</h3>
                    <button
                      type="button"
                      onClick={() => setShowCustomAmenityInput(true)}
                      className="text-xs font-bold text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 flex items-center gap-1 bg-secondary-50 dark:bg-secondary-950/50 px-3 py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-900"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Amenity
                    </button>
                  </div>

                  {/* Section 2: Custom Amenity Input Box */}
                  {showCustomAmenityInput && (
                    <div className="p-3.5 bg-secondary-50/70 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-900/50 rounded-2xl space-y-3">
                      <label className="text-xs font-bold text-secondary-900 dark:text-secondary-300 block">Amenity Name</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. RO Water, Balcony, Food Available"
                          value={customAmenityInput}
                          onChange={(e) => setCustomAmenityInput(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={handleAddCustomAmenity}
                          className="bg-secondary-600 text-white border-none font-bold text-xs px-4"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCustomAmenityInput(false)}
                          className="text-xs border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {amenitiesList.map((item) => {
                      const isSelected = selectedAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className={`p-3 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                            isSelected
                              ? 'bg-secondary-500 text-white border-secondary-500 shadow-sm'
                              : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>✓ {item}</span>
                          {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Images */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 4: Upload Room Images (Max 10)</h3>

                  <label className="border-2 border-dashed border-secondary-200 dark:border-secondary-900/50 bg-secondary-50/40 dark:bg-secondary-950/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-secondary-50/80 dark:hover:bg-secondary-950/40 transition-colors">
                    <UploadCloud className="w-8 h-8 text-secondary-600 dark:text-secondary-400 mb-2" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Click to upload photos</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG (Max 10 photos)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: 360 Tour */}
              {step === 5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 5: 360° Virtual Home Tour</h3>

                  <label className="border-2 border-dashed border-secondary-200 dark:border-secondary-900/50 bg-secondary-50/40 dark:bg-secondary-950/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-secondary-50/80 dark:hover:bg-secondary-950/40 transition-colors">
                    <Compass className="w-8 h-8 text-secondary-600 dark:text-secondary-400 mb-2" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Upload 360° Panorama Image or Tour File</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Panoramic 360 image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePanoramaUpload}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">360° Preview</label>
                    <PanoramaViewer imageUrl={panoramaUrl} title={title} />
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Review */}
              {step === 6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 6: Review Listing Details</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </button>
                  </div>

                  {/* Pricing Overview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Monthly Rent</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">₹{rentVal.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Advance Deposit</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">₹{(parseFloat(securityDeposit) || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Est. Total Monthly</span>
                      <p className="text-base font-extrabold text-secondary-600 dark:text-secondary-400">₹{estimatedMonthlyCost.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Extra Charges Breakdown */}
                  {extraChargesList.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Extra Charges Breakdown</span>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                        {extraChargesList.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">{c.name}:</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{c.amount}/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 360 Tour */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">360° Virtual Tour</span>
                    <PanoramaViewer imageUrl={panoramaUrl} title={title} />
                  </div>

                  {/* Amenities Selected */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Amenities ({selectedAmenities.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities.map((a) => (
                        <span key={a} className="bg-secondary-50 dark:bg-secondary-950/50 text-secondary-700 dark:text-secondary-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-secondary-100 dark:border-secondary-900">
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white border-none font-bold"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white border-none shadow-lg text-base px-6 font-bold"
                >
                  <Sparkles className="w-5 h-5 mr-1" /> Publish Property
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Success Animation Modal */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border border-gray-100 dark:border-slate-800"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Property Published!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your property is now live in **My Properties** and visible to thousands of students on the **Student Home Page**.
            </p>

            <Button
              onClick={handleFinishSuccess}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-secondary-600 to-secondary-500 border-none shadow-md text-base text-white font-bold"
            >
              Done & View Listing
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
