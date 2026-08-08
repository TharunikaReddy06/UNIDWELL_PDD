import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle2, User, Building, FileText, Hash, BookOpen, GraduationCap, Calendar, Edit3, ArrowLeft } from 'lucide-react';
import type { ExtractedIdData } from '../../utils/ocrService';
import type { Step1Data } from './Step1PersonalInfo';

export interface FinalScannedDetails {
  fullName: string;
  collegeName: string;
  registrationNumber: string;
  course: string;
  department: string;
  academicYear: string;
}

interface Props {
  formData: Partial<Step1Data>;
  extractedData: ExtractedIdData | null;
  collegeIdPreview: string | null;
  collegeIdFileName?: string;
  onConfirm: (finalDetails: FinalScannedDetails) => void;
  onBack: () => void;
  isLoading?: boolean;
  uploadProgress?: number;
  statusMessage?: string;
}

export default function Step4ReviewDetails({
  formData,
  extractedData,
  collegeIdPreview,
  collegeIdFileName = 'College ID Card',
  onConfirm,
  onBack,
  isLoading = false,
}: Props) {
  // Pre-fill inputs with OCR extracted data, fallback to step 1 formData if empty
  const [fullName, setFullName] = useState<string>(
    extractedData?.studentName || formData.name || ''
  );
  const [collegeName, setCollegeName] = useState<string>(
    extractedData?.collegeName || formData.college || ''
  );
  const [registrationNumber, setRegistrationNumber] = useState<string>(
    extractedData?.registrationNumber || ''
  );
  const [course, setCourse] = useState<string>(
    extractedData?.course || ''
  );
  const [department, setDepartment] = useState<string>(
    extractedData?.department || ''
  );
  const [academicYear, setAcademicYear] = useState<string>(
    extractedData?.academicYear || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onConfirm({
      fullName: fullName.trim(),
      collegeName: collegeName.trim(),
      registrationNumber: registrationNumber.trim(),
      course: course.trim(),
      department: department.trim(),
      academicYear: academicYear.trim(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Review Scanned Details</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Step 4 of 5 — Review and edit your extracted information</p>
      </div>

      {/* ✓ OCR Scan Successful Banner */}
      <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>✓ OCR Scan Successful</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Uploaded College ID Preview */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-3 bg-gray-50/80 dark:bg-slate-800/80 shadow-xs">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-semibold">
              Uploaded College ID Preview
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">Scanned Document</span>
          </p>

          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
            {collegeIdPreview === 'pdf' ? (
              <div className="text-center p-4">
                <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate max-w-[200px]">{collegeIdFileName}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Uploaded PDF Document</p>
              </div>
            ) : collegeIdPreview ? (
              <img src={collegeIdPreview} alt="Uploaded College ID Preview" className="w-full h-full object-contain" />
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">No preview available</p>
            )}
          </div>
        </div>

        {/* Editable Extracted Fields */}
        <div className="space-y-3 bg-primary-50/30 dark:bg-primary-950/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/40">
          <div className="flex items-center justify-between border-b border-primary-100 dark:border-primary-900/40 pb-2">
            <span className="text-xs font-bold text-primary-900 dark:text-primary-300 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> Extracted Student Details
            </span>
            <span className="text-[10px] font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/60 px-2 py-0.5 rounded-full">
              Editable Fields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="Student Name"
              icon={<User className="w-4 h-4 text-gray-400" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Student Name"
              required
            />

            <Input 
              label="College Name"
              icon={<Building className="w-4 h-4 text-gray-400" />}
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="College Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="Registration Number"
              icon={<Hash className="w-4 h-4 text-gray-400" />}
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Registration Number / Roll No."
            />

            <Input 
              label="Course"
              icon={<GraduationCap className="w-4 h-4 text-gray-400" />}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="Department"
              icon={<BookOpen className="w-4 h-4 text-gray-400" />}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
            />

            <Input 
              label="Academic Year"
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="Academic Year"
            />
          </div>
        </div>

        {/* Action Buttons: Back and Confirm & Create Account */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onBack} 
            disabled={isLoading} 
            fullWidth
            className="flex items-center justify-center gap-1.5 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none shadow-md flex items-center justify-center gap-2 text-white font-bold"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Confirm & Create Account</span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

