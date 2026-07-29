import { Request, Response } from 'express';
export declare const createCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getScheduledEmails: (req: Request, res: Response) => Promise<void>;
export declare const getSentEmails: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=campaignController.d.ts.map