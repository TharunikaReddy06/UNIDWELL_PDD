import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  Users, MessageSquare, Phone, Trash2, User, Search, 
  Building2, Calendar, ShieldCheck, X, Sparkles, MapPin 
} from 'lucide-react';
import type { InterestedStudentRecord } from '../types';

export default function OwnerInterestedStudents() {
  const navigate = useNavigate();
  const { user, interestedStudentsList, removeInterestedStudent, startConversation, markNotificationsReadByType } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<InterestedStudentRecord | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    markNotificationsReadByType(['INTERESTED_STUDENT', 'NEW_INTERESTED']);
  }, [markNotificationsReadByType]);

  // Filter interest records by searchQuery
  const filteredStudents = interestedStudentsList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(q) ||
      item.studentEmail.toLowerCase().includes(q) ||
      (item.studentPhone && item.studentPhone.includes(q)) ||
      item.propertyTitle.toLowerCase().includes(q)
    );
  });

  const handleStartChat = (item: InterestedStudentRecord) => {
    if (!user) return;
    const effectiveStudentId = item.studentId || item.studentUid || item.id;
    const effectiveStudentName = item.studentName || 'Student';
    const effectivePropId = item.propertyId || 'prop-1';
    const effectivePropTitle = item.propertyTitle || 'Property';

    const chatId = startConversation(
      effectivePropId,
      effectivePropTitle,
      user.id,
      user.name,
      {
        id: effectiveStudentId,
        name: effectiveStudentName,
        email: item.studentEmail || '',
        phone: item.studentPhone || '',
        college: item.studentCollege || item.collegeName || 'Verified Student',
        avatar: item.studentAvatar || item.profileImage || '',
        role: 'STUDENT',
        verified: true,
      }
    );
    navigate(`/chat/${chatId}`, {
      state: {
        activeChatId: chatId,
        chatId: chatId,
        studentId: effectiveStudentId,
        studentName: effectiveStudentName,
        propertyId: effectivePropId,
        propertyTitle: effectivePropTitle,
      },
    });
  };

  const handleViewProfile = (item: InterestedStudentRecord) => {
    setSelectedStudent(item);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                Real-Time Enquiries
              </span>
              <span className="bg-purple-400/20 border border-purple-300/40 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Live Firestore Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-200" />
              Interested Students ({interestedStudentsList.length})
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 font-medium max-w-xl">
              Students who clicked "I'm Interested" on your accommodations. Connect directly via chat, phone, or view profiles.
            </p>
          </div>
        </div>

        {/* Search Bar & Stats */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, email, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl text-xs font-semibold outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-purple-50 dark:bg-purple-950/50 px-4 py-2 rounded-2xl border border-purple-100 dark:border-purple-900/50">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Total Enquiries: <strong className="text-purple-700 dark:text-purple-300">{interestedStudentsList.length}</strong></span>
          </div>
        </div>

        {/* Interested Students Table / List View */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-center space-y-3">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Interested Students Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              When students click "I'm Interested" on your property listings, their details will appear here instantly in real time.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700 text-[11px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Property Name</th>
                    <th className="py-4 px-6">Interested Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs font-medium text-gray-700 dark:text-gray-200">
                  {filteredStudents.map((item) => (
                    <tr key={item.id || item.interestId} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                      {/* Photo & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.studentAvatar ? (
                            <img
                              src={item.studentAvatar}
                              alt={item.studentName}
                              className="w-10 h-10 rounded-full object-cover border border-purple-100 dark:border-purple-900"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                              {item.studentName?.[0] || 'S'}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
                              {item.studentName}
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            </h4>
                            <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium">
                              {item.studentCollege || 'Verified Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{item.studentEmail}</td>

                      {/* Phone */}
                      <td className="py-4 px-6 font-mono text-gray-700 dark:text-gray-300">
                        {item.studentPhone ? `+91 ${item.studentPhone}` : 'N/A'}
                      </td>

                      {/* Property */}
                      <td className="py-4 px-6 font-bold text-secondary-700 dark:text-secondary-400 max-w-xs truncate">
                        {item.propertyTitle}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-semibold">{item.createdAt}</td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block">
                          Interested
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartChat(item)}
                            title="Chat with Student"
                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xs transition-all flex items-center gap-1 text-[11px] font-bold"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          {item.studentPhone && (
                            <a
                              href={`tel:+91${item.studentPhone.replace(/\D/g, '')}`}
                              title="Call Student"
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-2xs transition-all flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleViewProfile(item)}
                            title="View Profile"
                            className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => removeInterestedStudent(item.id || item.interestId!)}
                            title="Remove Interest"
                            className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStudents.map((item) => (
                <div key={item.id || item.interestId} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm uppercase">
                        {item.studentName?.[0] || 'S'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{item.studentName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.studentEmail}</p>
                      </div>
                    </div>
                    <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      Interested
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-secondary-700 dark:text-secondary-400">{item.propertyTitle}</p>
                    {item.studentPhone && <p className="text-gray-600 dark:text-gray-300 font-mono">+91 {item.studentPhone}</p>}
                    <p className="text-[10px] text-gray-400 dark:text-gray-400">Interested Date: {item.createdAt}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(item)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex-1 py-2 rounded-xl"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat
                    </Button>
                    
                    {item.studentPhone && (
                      <a
                        href={`tel:+91${item.studentPhone.replace(/\D/g, '')}`}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProfile(item)}
                      className="border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold py-2 rounded-xl"
                    >
                      <User className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeInterestedStudent(item.id || item.interestId!)}
                      className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold py-2 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 relative border border-gray-100 dark:border-slate-800"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-2xl font-extrabold border-4 border-purple-50 dark:border-purple-900/40 shadow-inner uppercase">
                  {selectedStudent.studentName?.[0] || 'S'}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                  {selectedStudent.studentName}
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </h3>
                <span className="inline-block bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified Student Profile
                </span>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Email</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedStudent.studentEmail}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Phone</span>
                  <span className="font-bold font-mono text-gray-900 dark:text-white">{selectedStudent.studentPhone || 'Not provided'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">College</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedStudent.studentCollege || 'SIMATS Engineering'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Interested Property</span>
                  <span className="font-extrabold text-secondary-700 dark:text-secondary-400 truncate max-w-[180px]">{selectedStudent.propertyTitle}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    handleStartChat(selectedStudent);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Start Direct Chat
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
