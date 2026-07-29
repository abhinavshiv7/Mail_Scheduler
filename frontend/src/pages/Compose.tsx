import { useState, useRef } from 'react';
import { ArrowLeft, Paperclip, Clock, Send, Image, Type, AlignLeft, List, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import api from '../api/client';

export default function Compose() {
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayBetween, setDelayBetween] = useState('0');
  const [hourlyLimit, setHourlyLimit] = useState('200');
  const [scheduleDate, setScheduleDate] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const extractedEmails = results.data.map((row: any) => row[0]).filter(Boolean) as string[];
        const currentEmails = recipientsInput ? recipientsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
        const combined = Array.from(new Set([...currentEmails, ...extractedEmails])).join(', ');
        setRecipientsInput(combined);
        toast.success(`Loaded ${extractedEmails.length} recipients`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV');
        console.error(error);
      }
    });
  };

  const handleSend = async () => {
    const finalRecipients = recipientsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!subject || !body || finalRecipients.length === 0) {
      toast.error('Subject, body, and recipients are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/campaigns', {
        subject,
        body,
        delayBetween: Number(delayBetween),
        hourlyLimit: Number(hourlyLimit),
        recipients: finalRecipients,
        ...(scheduleDate && { startDate: new Date(scheduleDate).toISOString() }),
      });
      toast.success('Campaign scheduled successfully!');
      navigate('/dashboard/scheduled');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      
      {/* Top Action Bar */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-[#111827]">Compose New Email</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowSchedule(!showSchedule)}
              className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              <Clock className="w-5 h-5" />
            </button>
            
            {showSchedule && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg z-10 p-4">
                <h3 className="text-sm font-bold text-[#111827] mb-3">Send Later</h3>
                <div className="space-y-2">
                  <input 
                    type="datetime-local" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full text-sm p-2 border border-[#E5E7EB] rounded-[8px]" 
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-[#E5E7EB]">
                  <button onClick={() => {setScheduleDate(''); setShowSchedule(false)}} className="px-3 py-1.5 text-xs text-[#6B7280] font-medium">Clear</button>
                  <button onClick={() => setShowSchedule(false)} className="px-3 py-1.5 text-xs bg-[#16A34A] text-white rounded-[6px] font-medium">Done</button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSend}
            disabled={isSubmitting}
            className="flex items-center space-x-2 border-2 border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#F0FDF4] px-4 py-1.5 rounded-[8px] font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Sending...' : (scheduleDate ? 'Schedule' : 'Send')}</span>
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </header>

      {/* Compose Form */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-8">
        <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col h-full min-h-[600px]">
          
          <div className="p-6 space-y-4 border-b border-[#E5E7EB]">
            {/* From */}
            <div className="flex items-center border-b border-[#F3F4F6] pb-2">
              <span className="text-sm font-semibold text-[#6B7280] w-20">From:</span>
              <select className="flex-1 bg-transparent border-none text-sm text-[#111827] focus:ring-0 cursor-pointer outline-none">
                <option>Connected Account</option>
              </select>
            </div>

            {/* To */}
            <div className="flex items-center border-b border-[#F3F4F6] pb-2 relative">
              <span className="text-sm font-semibold text-[#6B7280] w-20">To:</span>
              <div className="flex-1 flex items-center">
                <input 
                  type="text" 
                  placeholder="Upload CSV or type emails separated by commas" 
                  className="flex-1 bg-transparent border-none text-sm text-[#111827] focus:ring-0 placeholder-[#D1D5DB] outline-none" 
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 flex items-center text-xs text-[#16A34A] font-semibold hover:bg-[#F0FDF4] px-2 py-1 rounded"
              >
                <UploadCloud className="w-4 h-4 mr-1" /> CSV
              </button>
              <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Subject */}
            <div className="flex items-center border-b border-[#F3F4F6] pb-2">
              <span className="text-sm font-semibold text-[#6B7280] w-20">Subject:</span>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject here..." 
                className="flex-1 bg-transparent border-none text-sm font-medium text-[#111827] focus:ring-0 placeholder-[#D1D5DB] outline-none" 
              />
            </div>

            {/* Config Limits */}
            <div className="flex space-x-6 pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#6B7280]">Delay (sec):</span>
                <input 
                  type="number" 
                  value={delayBetween}
                  onChange={(e) => setDelayBetween(e.target.value)}
                  className="w-16 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-2 py-1 text-xs text-center focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#6B7280]">Hourly Limit:</span>
                <input 
                  type="number" 
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-16 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-2 py-1 text-xs text-center focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-2 flex items-center space-x-4">
            <button className="p-1.5 text-[#6B7280] hover:bg-[#E5E7EB] rounded"><Type className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#6B7280] hover:bg-[#E5E7EB] rounded"><Image className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#6B7280] hover:bg-[#E5E7EB] rounded"><AlignLeft className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#6B7280] hover:bg-[#E5E7EB] rounded"><List className="w-4 h-4" /></button>
          </div>

          {/* Text Area */}
          <div className="flex-1 p-6">
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-sm text-[#111827] placeholder-[#D1D5DB] outline-none" 
              placeholder="Hi there! Write your email content here..."
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}
