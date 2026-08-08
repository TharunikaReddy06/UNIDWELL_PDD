import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { CollegeAutocomplete } from '../ui/CollegeAutocomplete';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollege: string;
  onApplyFilters: (filters: {
    college: string;
    location: string;
    maxRent: number;
    roomType: string;
    selectedAmenities: string[];
  }) => void;
}

const AMENITIES_LIST = [
  'WiFi', 'AC', 'Fan', 'Attached Bathroom', 'Parking', 'Power Backup',
  'Laundry', 'Security', 'Kitchen', 'Drinking Water', 'Lift', 'CCTV'
];

export default function FilterModal({
  isOpen,
  onClose,
  selectedCollege,
  onApplyFilters,
}: FilterModalProps) {
  const [college, setCollege] = useState(selectedCollege || '');
  const [location, setLocation] = useState('');
  const [maxRent, setMaxRent] = useState(25000);
  const [roomType, setRoomType] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      college,
      location,
      maxRent,
      roomType,
      selectedAmenities,
    });
    onClose();
  };

  const handleReset = () => {
    setCollege(selectedCollege || '');
    setLocation('');
    setMaxRent(25000);
    setRoomType('All');
    setSelectedAmenities([]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-5 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary-600" /> Filter Accommodation
            </h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Filters */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* College Search */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">College Nearby</label>
              <CollegeAutocomplete value={college} onChange={setCollege} />
            </div>

            {/* Room Type */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Room Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Single Room', 'Shared Room', 'Apartment', 'PG'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRoomType(t)}
                    className={`py-2 px-3 rounded-xl font-bold border text-left transition-all ${
                      roomType === t
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Rent Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-700">Max Monthly Rent</label>
                <span className="font-extrabold text-primary-600 text-sm">₹{maxRent.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="3000"
                max="30000"
                step="500"
                value={maxRent}
                onChange={(e) => setMaxRent(parseInt(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-medium">
                <span>₹3,000</span>
                <span>₹15,000</span>
                <span>₹30,000+</span>
              </div>
            </div>

            {/* Amenities Filter */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Amenities</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AMENITIES_LIST.map((item) => {
                  const isSelected = selectedAmenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-2 rounded-xl text-left border flex items-center justify-between font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 border-primary-300 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <Button variant="outline" fullWidth onClick={handleReset} className="text-xs font-bold">
              Reset Filters
            </Button>
            <Button onClick={handleApply} fullWidth className="bg-primary-600 text-white border-none text-xs font-bold">
              Apply Filters
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
