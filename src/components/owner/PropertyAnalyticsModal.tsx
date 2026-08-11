import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { X, Eye, Users, MessageSquare, GraduationCap, Calendar, Clock, User, ShieldCheck } from 'lucide-react';
import type { Property, PropertyViewLog, InterestedStudent } from '../../types';

interface PropertyAnalyticsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyAnalyticsModal({ property, isOpen, onClose }: PropertyAnalyticsModalProps) {
  const navigate = useNavigate();
  const { startConversation, user, propertyViews, interestedStudentsList } = useStore();
  const [activeTab, setActiveTab] = useState<'VIEWS' | 'INTERESTED'>('VIEWS');

  // Selected student for Profile modal
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; college?: string; avatar?: string; email?: string; phone?: string; id?: string } | null>(null);

  if (!isOpen || !property) return null;

  // Filter real Firestore views and interested students for this property
  const viewLogs = (propertyViews || []).filter((v) => v.propertyId === property.id);
  const interestedStudents = (interestedStudentsList || []).filter((s) => s.propertyId === property.id);

  const handleMessageStudent = (studentId: string, studentName: string, college?: string) => {
    if (!user) return;
    const chatId = startConversation(
      property.id,
      property.title,
      user.id,
      user.name,
      {
        id: studentId,
        name: studentName,
        email: '',
        role: 'STUDENT',
        verified: true,
        college: college || 'Student',
      }
    );
    onClose();
    navigate(`/chat/${chatId}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white line-clamp-1">{property.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Real student view logs & interested inquiries</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Header Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex-shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('VIEWS')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'VIEWS' ? 'bg-white dark:bg-slate-900 text-secondary-600 dark:text-secondary-400 shadow-xs font-black' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-500" />
              Viewing List ({viewLogs.length} Unique Views)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INTERESTED')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'INTERESTED' ? 'bg-white dark:bg-slate-900 text-secondary-600 dark:text-secondary-400 shadow-xs font-black' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4 text-purple-500" />
              Interested Students ({interestedStudents.length})
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {activeTab === 'VIEWS' && (
              <div className="space-y-3">
                {viewLogs.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500 space-y-1">
                    <Eye className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 opacity-40" />
                    <p className="text-xs font-semibold">No student views recorded yet</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">When real students open this property details, unique logs will appear here.</p>
                  </div>
                ) : (
                  viewLogs.map((log) => {
                    const avatar = log.profileImage || log.studentAvatar;
                    const college = log.collegeName || log.studentCollege || 'SIMATS Engineering';
                    return (
                      <div
                        key={log.id || log.viewId}
                        className="bg-gray-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-2xs hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img src={avatar} alt={log.studentName} className="w-10 h-10 rounded-full object-cover border border-secondary-200 dark:border-secondary-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                              {log.studentName[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1">
                              {log.studentName}
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-secondary-500 dark:text-secondary-400" />
                              {college}
                            </p>
                            {log.studentPhone && (
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">📞 {log.studentPhone}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded border border-green-200 dark:border-green-800 inline-block">
                            {log.status || 'Viewed'}
                          </span>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1 pt-0.5 font-mono">
                            <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            {log.viewedDate || log.viewedTime || 'Recent'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'INTERESTED' && (
              <div className="space-y-3">
                {interestedStudents.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500 space-y-1">
                    <Users className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 opacity-40" />
                    <p className="text-xs font-semibold">No interested students yet</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Students who tap "I'm Interested" will appear here in real time.</p>
                  </div>
                ) : (
                  interestedStudents.map((st) => {
                    const avatar = st.profileImage || st.studentAvatar;
                    const college = st.collegeName || st.studentCollege || 'SIMATS Engineering';
                    return (
                      <div
                        key={st.id || st.interestId}
                        className="bg-gray-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              <img src={avatar} alt={st.studentName} className="w-10 h-10 rounded-full object-cover border border-purple-200 dark:border-purple-800" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                                {st.studentName[0]}
                              </div>
                            )}
                            <div>
                              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1">
                                {st.studentName}
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                              </h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                {college}
                              </p>
                              {st.studentPhone && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">📞 {st.studentPhone}</p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              {st.status || 'Interested'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-slate-700">
                          <Button
                            size="sm"
                            onClick={() => handleMessageStudent(st.studentUid || st.studentId, st.studentName, college)}
                            className="flex-1 bg-secondary-600 text-white text-xs font-bold border-none py-1.5 rounded-xl flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Message Student
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudent({ 
                              name: st.studentName, 
                              college, 
                              avatar, 
                              email: st.studentEmail, 
                              phone: st.studentPhone, 
                              id: st.studentUid || st.studentId 
                            })}
                            className="flex-1 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <User className="w-3.5 h-3.5" /> View Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Student Profile Quick View Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center space-y-4 relative border border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-black text-xl mx-auto shadow-sm uppercase border-2 border-primary-200 dark:border-primary-800">
                  {selectedStudent.name[0]}
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center justify-center gap-1">
                    {selectedStudent.name}
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </h4>
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Verified Student
                  </span>
                </div>

                <div className="text-xs text-left bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl space-y-1.5 border border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">College:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedStudent.college || 'SIMATS Engineering'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Verification:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">ID Card Verified ✓</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    handleMessageStudent(st.id || 'std', st.name, st.college);
                  }}
                  fullWidth
                  className="bg-secondary-600 text-white border-none text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4 mr-1" /> Start Chat
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
