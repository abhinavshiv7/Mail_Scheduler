import { CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import api from '../api/client';

export default function Sent() {
  const { searchQuery, refreshTrigger, statusFilter } = useOutletContext<{ searchQuery: string, refreshTrigger: number, statusFilter: string }>();

  const { data: emails = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sentEmails'],
    queryFn: async () => {
      const response = await api.get('/api/campaigns/sent');
      return response.data;
    }
  });

  useEffect(() => {
    if (refreshTrigger > 0) refetch();
  }, [refreshTrigger, refetch]);

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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading sent emails...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load emails</div>;
  if (filteredEmails.length === 0) return <div className="p-8 text-center text-gray-500">No sent emails match your search</div>;

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] overflow-hidden">
      <div className="divide-y divide-[#E5E7EB]">
        {filteredEmails.map((email: any) => (
          <div 
            key={email.id} 
            className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-sm font-semibold text-[#111827] truncate w-48">To: {email.recipientEmail}</span>
                <span className="text-xs text-[#6B7280]">
                  {email.sentTime ? new Date(email.sentTime).toLocaleString() : 'Unknown time'}
                </span>
              </div>
              <div className="flex items-center text-sm truncate">
                <span className="font-semibold text-[#111827] mr-2">{email.campaign?.subject}</span>
                <span className="text-[#6B7280] truncate">- {email.campaign?.body?.substring(0, 50)}...</span>
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0 flex items-center">
              {email.status === 'sent' ? (
                <div className="flex items-center text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-medium">Delivered</span>
                </div>
              ) : (
                <div className="flex items-center text-[#DC2626] bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#fecaca]">
                  <XCircle className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-medium">Failed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
