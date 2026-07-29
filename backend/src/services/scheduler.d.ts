interface ScheduleCampaignParams {
    userId: string;
    subject: string;
    body: string;
    delayBetween: number;
    hourlyLimit: number;
    recipients: string[];
    startDate: Date;
}
export declare const scheduleCampaign: (params: ScheduleCampaignParams) => Promise<{
    id: string;
    userId: string;
    subject: string;
    body: string;
    delayBetween: number;
    hourlyLimit: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=scheduler.d.ts.map