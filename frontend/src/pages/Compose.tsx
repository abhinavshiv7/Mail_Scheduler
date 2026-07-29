import { useState, useRef } from 'react';
import { ArrowLeft, Paperclip, Clock, Send, Image, Type, AlignLeft, List, UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import api from '../api/client';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Add this above the Compose component
const modules = {
  toolbar: {
    container: '#toolbar',
  }
};
const formats = [
  'bold', 'italic', 'underline', 'list', 'bullet', 'indent', 'link', 'clean', 'header'
];

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
  
  // Attachments state
  const [attachments, setAttachments] = useState<{filename: string, content: string, mimeType: string}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

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

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments: {filename: string, content: string, mimeType: string}[] = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newAttachments.push({
            filename: file.name,
            content: event.target.result.toString(),
            mimeType: file.type
          });
          
          if (newAttachments.length === files.length) {
            setAttachments(prev => [...prev, ...newAttachments]);
            toast.success(`Added ${files.length} attachment(s)`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const finalRecipients = recipientsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!subject || !body || body === '<p><br></p>' || finalRecipients.length === 0) {
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
        attachments,
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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <style>{`
        .ql-container.ql-snow { border: none; font-family: inherit; font-size: 14px; }
        .ql-editor { padding: 24px; min-height: 200px; color: #111827; }
        .ql-editor.ql-blank::before { color: #9CA3AF; font-style: normal; left: 24px; }
        .ql-toolbar.ql-snow { border: none; border-top: 1px solid #F3F4F6; padding: 12px 24px; }
      `}</style>
      
      {/* Top Action Bar */}
      <header className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 text-[#111827] hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-normal text-[#111827]">Compose New Email</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors" onClick={() => attachmentInputRef.current?.click()}>
            <Paperclip className="w-5 h-5" />
          </button>
          <input type="file" multiple ref={attachmentInputRef} className="hidden" onChange={handleAttachmentUpload} />
          
          <div className="relative">
            <button 
              onClick={() => setShowSchedule(!showSchedule)}
              className="p-2 text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              <Clock className="w-5 h-5" />
            </button>
            
            {showSchedule && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg z-10 p-5">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Send Later</h3>
                
                <div className="relative mb-4">
                  <input 
                    type="datetime-local" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    placeholder="Pick date & time"
                    className="w-full text-sm p-3 border-b border-[#E5E7EB] focus:outline-none text-[#6B7280] placeholder-[#9CA3AF]" 
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <button onClick={() => setScheduleDate('Tomorrow')} className="block w-full text-left text-sm text-[#4B5563] hover:text-[#111827]">Tomorrow</button>
                  <button onClick={() => setScheduleDate('Tomorrow, 10:00 AM')} className="block w-full text-left text-sm text-[#4B5563] hover:text-[#111827]">Tomorrow, 10:00 AM</button>
                  <button onClick={() => setScheduleDate('Tomorrow, 11:00 AM')} className="block w-full text-left text-sm text-[#4B5563] hover:text-[#111827]">Tomorrow, 11:00 AM</button>
                  <button onClick={() => setScheduleDate('Tomorrow, 3:00 PM')} className="block w-full text-left text-sm text-[#4B5563] hover:text-[#111827]">Tomorrow, 3:00 PM</button>
                </div>

                <div className="flex justify-end space-x-4">
                  <button onClick={() => {setScheduleDate(''); setShowSchedule(false)}} className="px-4 py-2 text-sm text-[#111827] font-semibold">Cancel</button>
                  <button onClick={() => setShowSchedule(false)} className="px-6 py-2 text-sm border border-[#16A34A] text-[#16A34A] rounded-full font-semibold">Done</button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSend}
            disabled={isSubmitting}
            className="px-6 py-1.5 border border-[#16A34A] text-[#16A34A] bg-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </header>

      {/* Compose Form */}
      <div className="flex-1 max-w-[1000px] w-full mx-auto p-8 pt-4">
        
        <div className="space-y-0">
          {/* From */}
          <div className="flex items-center py-4">
            <span className="text-sm font-medium text-[#4B5563] w-24">From</span>
            <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-md flex items-center space-x-2 cursor-pointer">
              <span className="text-sm text-[#111827]">
                {(() => {
                  try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                      return JSON.parse(storedUser).email || 'oliver.brown@domain.io';
                    }
                  } catch (e) {}
                  return 'oliver.brown@domain.io';
                })()}
              </span>
              <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* To */}
          <div className="flex items-center py-4 border-t border-[#F3F4F6]">
            <span className="text-sm font-medium text-[#111827] w-24">To</span>
            <div className="flex-1 flex items-center">
              <input 
                type="text" 
                placeholder="recipient@example.com" 
                className="flex-1 bg-transparent border-none text-sm text-[#111827] focus:ring-0 placeholder-[#9CA3AF] outline-none" 
                value={recipientsInput}
                onChange={(e) => setRecipientsInput(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="ml-2 flex items-center text-xs text-[#6B7280] font-semibold hover:bg-gray-100 px-3 py-1.5 rounded-md border border-[#E5E7EB]"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" /> Upload List
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Subject */}
          <div className="flex items-center py-4 border-t border-[#F3F4F6]">
            <span className="text-sm font-medium text-[#111827] w-24">Subject</span>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject" 
              className="flex-1 bg-transparent border-none text-sm text-[#111827] focus:ring-0 placeholder-[#9CA3AF] outline-none" 
            />
          </div>

          {/* Config Limits */}
          <div className="flex items-center py-4 border-t border-[#F3F4F6]">
            <span className="text-sm font-medium text-[#111827] mr-4">Delay between 2 emails</span>
            <input 
              type="number" 
              value={delayBetween}
              onChange={(e) => setDelayBetween(e.target.value)}
              className="w-16 border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm text-[#9CA3AF] text-center focus:outline-none focus:border-[#D1D5DB]" 
            />
            
            <span className="text-sm font-medium text-[#111827] ml-8 mr-4">Hourly Limit</span>
            <input 
              type="number" 
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
              className="w-16 border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm text-[#9CA3AF] text-center focus:outline-none focus:border-[#D1D5DB]" 
            />
          </div>

          {/* Attachments UI */}
          {attachments.length > 0 && (
            <div className="flex items-center py-4 border-t border-[#F3F4F6] flex-wrap gap-3">
              <span className="text-sm font-medium text-[#111827] w-24">Attachments</span>
              {attachments.map((att, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 shadow-sm">
                  <Paperclip className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="text-xs text-[#4B5563] font-medium max-w-[150px] truncate">{att.filename}</span>
                  <button onClick={() => removeAttachment(index)} className="text-[#9CA3AF] hover:text-[#EF4444] ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="mt-4 bg-[#F9FAFB] rounded-xl flex flex-col min-h-[400px]">
          <ReactQuill 
            theme="snow"
            value={body}
            onChange={setBody}
            modules={modules}
            formats={formats}
            placeholder="Type Your Reply..."
            className="flex-1"
          />
          
          {/* Custom Editor Toolbar */}
          <div id="toolbar" className="flex items-center space-x-2 text-[#9CA3AF]">
            <button className="ql-clean">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            </button>
            <button className="ql-header" value="1">
              <span className="font-serif font-bold text-lg leading-none">T<span className="text-sm">T</span></span>
            </button>
            <div className="h-4 w-px bg-[#E5E7EB] mx-1"></div>
            <button className="ql-bold"><span className="font-bold text-lg leading-none">B</span></button>
            <button className="ql-italic"><span className="italic font-serif text-lg leading-none">I</span></button>
            <button className="ql-underline"><span className="underline font-medium text-lg leading-none">U</span></button>
            <div className="h-4 w-px bg-[#E5E7EB] mx-1"></div>
            <button className="ql-list" value="ordered"><List className="w-4 h-4" /></button>
            <button className="ql-list" value="bullet">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <button className="ql-indent" value="-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <button className="ql-indent" value="+1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <div className="h-4 w-px bg-[#E5E7EB] mx-1"></div>
            <button className="ql-link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
