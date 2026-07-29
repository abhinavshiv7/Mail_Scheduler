import { CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Sent() {
  const navigate = useNavigate();
  const { searchQuery, refreshTrigger } = useOutletContext<{ searchQuery: string, refreshTrigger: number }>();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['sentEmails', refreshTrigger],
    queryFn: async () => {
      const response = await api.get('/api/campaigns/sent');
      return response.data;
    }
  });

  const toggleStar = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/api/campaigns/email/${id}/star`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentEmails'] });
    }
  });

  const filteredEmails = emails.filter((email: any) => 
    email.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div></div>;
  }

  if (filteredEmails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No sent emails</h3>
        <p className="text-sm text-gray-500">Emails you send will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
      <div className="divide-y divide-[#F3F4F6]">
        {filteredEmails.map((email: any) => (
          <div 
            key={email.id} 
            className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
            onClick={() => navigate(`/dashboard/email/${email.id}`)}
          >
            <div className="flex-1 flex items-center space-x-4 min-w-0 pr-4">
              <span className="text-sm font-semibold text-[#111827] truncate w-48 shrink-0">
                To: {email.recipientEmail.split('@')[0]}
              </span>
              
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] shrink-0">
                {email.status === 'sent' ? 'Sent' : 'Failed'}
              </span>

              <div className="flex-1 flex items-center text-sm truncate min-w-0">
                <span className="font-semibold text-[#111827] mr-2 shrink-0">{email.campaign?.subject}</span>
                <span className="text-[#9CA3AF] truncate">- {email.campaign?.body?.replace(/<[^>]*>?/gm, '').substring(0, 80)}</span>
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
              <button 
                onClick={(e) => { e.stopPropagation(); /* toggleStarMutation.mutate(email.id); */ }}
                className={`transition-colors focus:outline-none ${email.isStarred ? 'text-[#F59E0B]' : 'text-[#D1D5DB] hover:text-[#9CA3AF]'}`}
              >
                <Star className="w-5 h-5" fill={email.isStarred ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
