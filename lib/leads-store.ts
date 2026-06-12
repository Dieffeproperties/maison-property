export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'negotiating'
  | 'proposal'
  | 'signed'
  | 'lost';

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  message: string;
  createdAt: string;
  status: LeadStatus;
  notes?: string;
};

export const globalLeads: Lead[] = [];
