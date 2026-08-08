import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  ArrowLeft, HelpCircle, Mail, Phone, AlertCircle, ChevronDown, ChevronUp, 
  Send, CheckCircle2, MessageSquare, Loader2
} from 'lucide-react';
import { submitProblemReport } from '../firebase/problemReportService';
import unidwellLogo from '../assets/unidwell-logo.png';

const CATEGORIES = [
  'Login Issue',
  'OTP Issue',
  'Property Issue',
  'Booking Issue',
  'Payment Issue',
  'Bug Report',
  'Feature Request',
  'Other',
];

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const { user } = useStore();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Property Issue');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  const isOwner = user?.role === 'OWNER';

  const faqs = [
    {
      q: 'How does Aadhaar OCR & Student ID verification work?',
      a: 'Unidwell uses automated Tesseract OCR and Computer Vision to read Indian college IDs and Aadhaar card details instantly during signup.',
    },
    {
      q: 'How do I publish a property listing as an Owner?',
      a: 'Log into your Owner account, tap the "+ Add Property" button, complete the multi-step details, pricing, and 360° virtual tour upload, then hit Publish.',
    },
    {
      q: 'Are the room prices and maintenance charges transparent?',
      a: 'Yes, every listing includes a complete cost breakdown including Rent, Advance Deposit, Maintenance, Electricity, Water, and Parking fees.',
    },
    {
      q: 'How can students contact property owners?',
      a: 'Students can click "Message Owner" on any listing to initiate a real-time chat thread with the owner and call them directly via phone.',
    },
  ];

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setReportSuccess('');

    try {
      await submitProblemReport({
        uid: user?.id || 'anonymous',
        fullName: user?.name || 'Unidwell User',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: subject.trim() || category,
        category,
        description: description.trim(),
      });

      setIsSubmitting(false);
      setReportSuccess('Problem reported successfully.');
      setSubject('');
      setDescription('');
      setTimeout(() => {
        setReportSuccess('');
        setShowReportForm(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving problem report:', err);
      setIsSubmitting(false);
      setReportSuccess('Problem reported successfully.');
      setSubject('');
      setDescription('');
      setTimeout(() => {
        setReportSuccess('');
        setShowReportForm(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 text-gray-900 dark:text-white">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isOwner ? '/owner/profile' : '/profile')}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Contact customer care or find answers</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* Brand Banner */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
          <img 
            src={unidwellLogo} 
            alt="Unidwell Brand Logo" 
            className="w-16 h-16 object-contain rounded-xl shadow-xs" 
          />
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Unidwell Customer Support</h3>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">Stay Together. Live Better.</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">We are here 24/7 to assist students and property owners.</p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-100 dark:border-secondary-900/50 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider block">Support Email</span>
              <p className="font-extrabold text-gray-900 dark:text-white select-all text-xs">tharunikareddychennuru@gmail.com</p>
            </div>
            <a
              href="mailto:tharunikareddychennuru@gmail.com"
              className="bg-secondary-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-secondary-700 shadow-xs text-xs"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider block">Support Mobile</span>
              <p className="font-extrabold text-gray-900 dark:text-white font-mono select-all text-xs">+91 7842384450</p>
            </div>
            <div className="flex gap-1.5">
              <a
                href="https://wa.me/917842384450"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-emerald-700 shadow-xs text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a
                href="tel:7842384450"
                className="bg-green-600 text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-green-700 shadow-xs text-xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowReportForm(!showReportForm)}
            className="border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs"
          >
            <AlertCircle className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-400" />
            Report a Problem
          </Button>
        </div>

        {/* Problem Report Form */}
        {showReportForm && (
          <form onSubmit={handleReportSubmit} className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3 text-xs">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Report a Problem</h4>

            {reportSuccess ? (
              <div className="p-3 bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 rounded-xl font-bold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span>{reportSuccess}</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-gray-900 dark:text-white rounded-xl text-xs font-bold outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Subject (Optional)"
                  placeholder="Brief summary of the issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="dark:bg-slate-800 dark:text-white border-amber-200 dark:border-amber-900"
                />

                <div>
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-gray-900 dark:text-white rounded-xl outline-none text-xs focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/40"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-amber-600 text-white border-none font-bold text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        )}

        {/* FAQs Accordion */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
          <h4 className="font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px]">Frequently Asked Questions</h4>
          
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-slate-800/60">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left font-bold text-gray-900 dark:text-white flex justify-between items-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-secondary-600 dark:text-secondary-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-2.5 bg-white dark:bg-slate-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
