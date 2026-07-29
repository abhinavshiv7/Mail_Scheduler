import { ArrowLeft, Star, Archive, Trash2, ChevronDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function EmailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: email, isLoading, error } = useQuery({
    queryKey: ['email', id],
    queryFn: async () => {
      const response = await api.get(`/api/campaigns/email/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div></div>;
  }

  if (error || !email) {
    return <div className="p-8 text-center text-red-500">Failed to load email.</div>;
  }

  // Formatting date similar to screenshot: "Nov 3, 10:23 AM"
  const formattedDate = new Date(email.scheduledTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const attachments = email.campaign?.attachments || [];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans -m-8">
      {/* Top Bar matching the screenshot */}
      <div className="h-16 border-b border-[#E5E7EB] flex items-center justify-between px-6">
        <div className="flex items-center space-x-3 text-[#111827]">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-lg font-normal truncate max-w-xl">
            {email.campaign.subject}
          </h1>
        </div>

        <div className="flex items-center space-x-5 text-gray-400">
          <button className="hover:text-gray-600 transition-colors">
            <Star className="w-5 h-5" fill={email.isStarred ? '#F59E0B' : 'none'} color={email.isStarred ? '#F59E0B' : 'currentColor'} />
          </button>
          <button className="hover:text-gray-600 transition-colors">
            <Archive className="w-5 h-5" />
          </button>
          <button className="hover:text-gray-600 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-gray-200"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ml-2">
            <img src={email.campaign?.user?.avatarUrl || "https://i.pravatar.cc/150?u=oliver"} alt="avatar" />
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-8">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start space-x-4">
              {email.campaign?.user?.avatarUrl ? (
                <img 
                  src={email.campaign.user.avatarUrl} 
                  alt="sender avatar" 
                  className="w-10 h-10 rounded-full shrink-0 object-cover" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  {(email.campaign?.user?.name || email.campaign?.user?.email || 'A')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#111827]">
                    {email.campaign?.user?.name || email.campaign?.user?.email?.split('@')[0]}
                  </span>
                  <span className="text-sm text-gray-500">
                    &lt;{email.campaign?.user?.email}&gt;
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-0.5 cursor-pointer hover:text-gray-700">
                  to {email.recipientEmail} <ChevronDown className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-1 shrink-0">
              {formattedDate}
            </div>
          </div>

          {/* Email Content HTML */}
          <div 
            className="prose prose-sm max-w-none text-[#111827] prose-p:leading-relaxed prose-a:text-[#16A34A]"
            dangerouslySetInnerHTML={{ __html: email.campaign.body }}
          />

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-100 pt-6">
              {attachments.map((att: any, idx: number) => {
                // Estimate size based on base64 length (approx 75% of length = bytes)
                const bytes = att.content ? Math.floor(att.content.length * 0.75) : 1200000;
                const sizeMB = (bytes / (1024 * 1024)).toFixed(1);
                
                const isImage = att.mimeType?.startsWith('image/') || att.contentType?.startsWith('image/');
                const previewSrc = isImage ? `data:${att.mimeType || att.contentType};base64,${att.content.split('base64,')[1] || att.content}` : null;

                return (
                  <div key={idx} className="w-[200px] flex flex-col border border-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                    <div className="h-[120px] bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
                      {previewSrc ? (
                        <img src={previewSrc} alt={att.filename} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 font-medium bg-gray-100 w-full h-full flex items-center justify-center text-3xl">
                          {att.filename.split('.').pop()?.toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="text-sm font-medium text-gray-800 truncate" title={att.filename}>
                        {att.filename}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sizeMB} MB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
