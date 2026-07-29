import { Star, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import api from '../api/client';

export default function Scheduled() {
  const navigate = useNavigate();
  const { searchQuery, refreshTrigger, statusFilter } = useOutletContext<{ searchQuery: string, refreshTrigger: number, statusFilter: string }>();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading, error, refetch } = useQuery({
    queryKey: ['scheduledEmails'],
    queryFn: async () => {
      const response = await api.get('/api/campaigns/scheduled');
      return response.data;
    }
  });

  useEffect(() => {
    if (refreshTrigger > 0) refetch();
  }, [refreshTrigger, refetch]);

  const toggleStarMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/api/campaigns/email/${id}/star`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
    }
  });

  const filteredEmails = useMemo(() => {
    let result = emails;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((e: any) => e.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((e: any) => 
        e.recipientEmail.toLowerCase().includes(lowerQuery) || 
        (e.campaign?.subject && e.campaign.subject.toLowerCase().includes(lowerQuery))
      );
    }
    
    return result;
  }, [emails, searchQuery, statusFilter]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading scheduled emails...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load emails</div>;
  if (filteredEmails.length === 0) return <div className="p-8 text-center text-gray-500">No scheduled emails match your search</div>;

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] overflow-hidden">
      <div className="divide-y divide-[#E5E7EB]">
        {filteredEmails.map((email: any) => (
          <div 
            key={email.id} 
            className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
            onClick={() => navigate(`/dashboard/email/${email.id}`)}
          >
            <div className="flex-1 flex items-center space-x-4 min-w-0 pr-4">
              <span className="text-sm font-semibold text-[#111827] truncate w-48 shrink-0">
                To: {email.recipientEmail.split('@')[0]}
              </span>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#EA580C] shrink-0 w-44 justify-center">
                <Clock className="w-3 h-3 mr-1.5" />
                {new Date(email.scheduledTime).toLocaleString()}
              </span>

              <div className="flex-1 flex items-center text-sm truncate min-w-0">
                <span className="font-semibold text-[#111827] mr-2 shrink-0">{email.campaign?.subject}</span>
                <span className="text-[#6B7280] truncate">- {email.campaign?.body?.replace(/<[^>]*>?/gm, '').substring(0, 80)}</span>
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${email.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {email.status}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleStarMutation.mutate(email.id); }}
                className={`transition-colors focus:outline-none ${email.isStarred ? 'text-[#F59E0B]' : 'text-[#9CA3AF] hover:text-[#F59E0B]'}`}
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
