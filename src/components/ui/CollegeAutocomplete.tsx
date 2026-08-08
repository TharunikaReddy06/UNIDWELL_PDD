import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Search, Check, MapPin, X, ChevronDown } from 'lucide-react';
import { filterColleges, type College } from '../../data/colleges';

interface Props {
  value: string;
  onChange: (collegeName: string) => void;
  error?: string;
}

export function CollegeAutocomplete({ value, onChange, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterColleges(searchQuery);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSelect = (college: College) => {
    onChange(college.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        College / University Name
      </label>

      {/* Main Select Field Box */}
      <div
        onClick={handleOpen}
        className={`relative flex items-center w-full pl-10 pr-10 py-3 border rounded-xl bg-white cursor-pointer transition-all duration-200 shadow-sm ${
          error
            ? 'border-red-500 ring-2 ring-red-100'
            : isOpen
            ? 'border-primary-500 ring-2 ring-primary-100'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Building className="w-5 h-5" />
        </div>

        <span
          className={`block truncate text-sm select-none ${
            value ? 'text-gray-900 font-semibold' : 'text-gray-400'
          }`}
        >
          {value || 'Search & select your college...'}
        </span>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary-600' : ''
            }`}
          />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>}

      {/* Searchable Dropdown Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Search Bar inside Dropdown */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type college, university, city (e.g. SIMATS, VIT, IIT)..."
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable College Suggestions List */}
            <div className="max-h-64 overflow-y-auto p-1 divide-y divide-gray-50 scrollbar-thin">
              {filtered.length > 0 ? (
                filtered.map((college) => {
                  const isSelected = value === college.name;
                  return (
                    <div
                      key={college.id}
                      onClick={() => handleSelect(college)}
                      className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-900 font-medium'
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 break-words">
                            {college.name}
                          </span>
                          {college.shortName && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-md">
                              {college.shortName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {college.city}, {college.state}
                          </span>
                          {college.university && (
                            <span className="truncate max-w-[180px]">
                              • {college.university}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 px-4 text-center">
                  <p className="text-sm font-medium text-gray-500">No matching college found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching by city or university name</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
