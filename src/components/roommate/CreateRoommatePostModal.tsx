import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CollegeAutocomplete } from '../ui/CollegeAutocomplete';
import { X, Users, Sparkles, Check } from 'lucide-react';
import type { RoommatePost } from '../../types';

interface CreateRoommatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: RoommatePost | null;
}

const LIFESTYLE_TAGS = [
  'Early Bird', 'Night Owl', 'Studious', 'Non-Smoker', 'Fitness',
  'Pet Friendly', 'Vegetarian', 'Music Lover', 'Clean Freak', 'Quiet'
];

export default function CreateRoommatePostModal({ isOpen, onClose, postToEdit }: CreateRoommatePostModalProps) {
  const { user, addRoommatePost, updateRoommatePost } = useStore();

  const [postType, setPostType] = useState<'LOOKING_FOR_ROOM' | 'LOOKING_FOR_ROOMMATE'>(
    postToEdit?.type || 'LOOKING_FOR_ROOMMATE'
  );
  const [collegeName, setCollegeName] = useState(
    postToEdit?.collegeName || user?.college || 'SIMATS School of Engineering'
  );
  const [preferredLocation, setPreferredLocation] = useState(
    postToEdit?.preferredLocation || 'Thandalam / Poonamallee'
  );
  const [budget, setBudget] = useState(postToEdit?.budget ? String(postToEdit.budget) : '8000');
  const [genderPreference, setGenderPreference] = useState<'Male' | 'Female' | 'Any'>(
    postToEdit?.genderPreference || 'Any'
  );
  const [roomType, setRoomType] = useState<'Single Room' | 'Shared Room' | 'Apartment' | 'PG' | 'Any'>(
    postToEdit?.roomType || 'Single Room'
  );
  const [moveInDate, setMoveInDate] = useState(postToEdit?.moveInDate || 'Immediate');
  const [aboutMe, setAboutMe] = useState(
    postToEdit?.aboutMe || postToEdit?.description || 'Studious and clean student looking for compatible roommates.'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    postToEdit?.lifestyleTags || ['Studious', 'Non-Smoker', 'Quiet']
  );

  if (!isOpen || !user) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (postToEdit) {
      updateRoommatePost(postToEdit.id, {
        type: postType,
        collegeName,
        preferredLocation,
        budget: parseFloat(budget) || 8000,
        genderPreference,
        roomType,
        moveInDate: moveInDate || 'Immediate',
        aboutMe,
        description: aboutMe,
        lifestyleTags: selectedTags,
      });
    } else {
      const newPost: RoommatePost = {
        id: `rm-${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        authorCollege: user.college || collegeName,
        authorAvatar: user.avatar,
        type: postType,
        collegeName,
        preferredLocation,
        budget: parseFloat(budget) || 8000,
        genderPreference,
        roomType,
        moveInDate: moveInDate || 'Immediate',
        aboutMe,
        description: aboutMe,
        lifestyleTags: selectedTags,
        aiMatchScore: 96,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      addRoommatePost(newPost);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-primary-600" />
                {postToEdit ? 'Edit Roommate Post' : 'Create Roommate Post'}
              </h3>
              <p className="text-xs text-gray-500">Post your requirement to find compatible student roommates</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Looking For */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Looking For</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPostType('LOOKING_FOR_ROOMMATE')}
                  className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                    postType === 'LOOKING_FOR_ROOMMATE'
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Roommate (Have a Room)
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('LOOKING_FOR_ROOM')}
                  className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                    postType === 'LOOKING_FOR_ROOM'
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Room (Need a Room)
                </button>
              </div>
            </div>

            {/* College Name */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">College Name</label>
              <CollegeAutocomplete value={collegeName} onChange={setCollegeName} />
            </div>

            {/* Preferred Location & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Preferred Location"
                placeholder="Area / Landmark"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
              />
              <Input
                label="Monthly Budget (₹)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Gender Preference & Room Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gender Preference</label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold"
                >
                  <option value="Any">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Room Type</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold"
                >
                  <option value="Single Room">Single Room</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="Apartment">Apartment</option>
                  <option value="PG">PG</option>
                  <option value="Any">Any Type</option>
                </select>
              </div>
            </div>

            {/* Move-in Date */}
            <Input
              label="Preferred Move-in Date"
              placeholder="e.g. Immediate / 15 August"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />

            {/* Lifestyle Tags */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Lifestyle Preferences</label>
              <div className="flex flex-wrap gap-1.5">
                {LIFESTYLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full font-semibold text-[11px] border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 border-primary-300 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <Check className="w-3 h-3 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About Me */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">About Me</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your study habits, personality, and expectations..."
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Buttons: Publish & Cancel */}
            <div className="pt-2 flex gap-2">
              <Button type="button" variant="outline" fullWidth onClick={onClose} className="text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" fullWidth className="bg-primary-600 text-white border-none font-bold text-xs">
                <Sparkles className="w-4 h-4 mr-1" /> {postToEdit ? 'Save Changes' : 'Publish'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
