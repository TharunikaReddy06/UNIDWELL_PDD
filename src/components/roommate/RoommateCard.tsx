import { useState } from 'react';
import type { RoommatePost } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MessageSquare, ShieldCheck, User, MapPin, Calendar, Edit3, Trash2, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  post: RoommatePost;
  onEdit?: (post: RoommatePost) => void;
}

export const RoommateCard: React.FC<Props> = ({ post, onEdit }) => {
  const navigate = useNavigate();
  const { user, deleteRoommatePost, startConversation } = useStore();

  const [showProfileModal, setShowProfileModal] = useState(false);

  const isAuthor = user?.id === post.authorId;
  const authorName = post.authorName || 'Student';
  const college = post.authorCollege || post.collegeName || 'SIMATS Engineering';
  const aboutMeText = post.aboutMe || post.description || 'Looking for a compatible roommate.';

  const handleMessageStudent = () => {
    if (!user) return;
    const chatId = startConversation(
      `roommate-${post.id}`,
      `Roommate Inquiry: ${post.roomType} (${post.preferredLocation})`,
      post.authorId,
      authorName,
      user
    );
    navigate(`/chat/${chatId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your roommate post?')) {
      deleteRoommatePost(post.id);
    }
  };

  return (
    <Card className="mb-4 shadow-md rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <CardContent className="p-5 space-y-4">
        {/* Top Bar: Author Avatar, Name & College */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-black text-lg border border-primary-200 dark:border-primary-800 uppercase flex-shrink-0">
              {authorName[0]}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{authorName}</h3>
                <ShieldCheck className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{college}</p>
            </div>
          </div>

          <Badge variant="success" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-[10px] font-bold px-2 py-0.5">
            {post.aiMatchScore || 95}% Match
          </Badge>
        </div>

        {/* Post Type & Location */}
        <div>
          <div className="flex gap-2 mb-2 flex-wrap items-center">
            <Badge variant={post.type === 'LOOKING_FOR_ROOM' ? 'primary' : 'secondary'} className="text-[10px] font-bold">
              {post.type === 'LOOKING_FOR_ROOM' ? 'Need a Room' : 'Have a Room'}
            </Badge>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary-600 dark:text-primary-400" /> {post.preferredLocation}
            </span>
          </div>

          {/* About Me / Description */}
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium bg-gray-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            "{aboutMeText}"
          </p>
        </div>

        {/* Lifestyle Tags */}
        {post.lifestyleTags && post.lifestyleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.lifestyleTags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold bg-primary-50/70 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 px-2.5 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/50">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Grid Info: Budget & Move-in Date */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 block">Monthly Budget</span>
            <span className="font-black text-primary-600 dark:text-primary-400 text-sm">₹{post.budget.toLocaleString()}<span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">/mo</span></span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" /> Move-in Date
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{post.moveInDate}</span>
          </div>
        </div>

        {/* Action Buttons: View Profile & Message Student */}
        <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfileModal(true)}
            className="flex-1 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs py-1.5"
          >
            <User className="w-3.5 h-3.5 mr-1" /> View Profile
          </Button>

          {!isAuthor ? (
            <Button
              size="sm"
              onClick={handleMessageStudent}
              className="flex-1 bg-primary-600 text-white font-bold text-xs border-none py-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message Student
            </Button>
          ) : (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-bold text-xs py-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>

      {/* View Profile Dialog */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center space-y-4 relative border border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-black text-2xl mx-auto border-2 border-primary-200 dark:border-primary-800 shadow-sm uppercase">
              {authorName[0]}
            </div>

            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center justify-center gap-1">
                {authorName}
                <ShieldCheck className="w-4 h-4 text-green-500" />
              </h4>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                Verified Student
              </span>
            </div>

            <div className="text-xs text-left bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl space-y-1.5 border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">College:</span>
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{college}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">₹{post.budget.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Move-in Date:</span>
                <span className="font-bold text-gray-900 dark:text-white">{post.moveInDate}</span>
              </div>
            </div>

            {!isAuthor && (
              <Button
                onClick={() => {
                  setShowProfileModal(false);
                  handleMessageStudent();
                }}
                fullWidth
                className="bg-primary-600 text-white border-none text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4 mr-1" /> Message Student
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
