export interface AdminInvitation {
  id: number;
  email: string;
  invitedAt: Date;
  expiredAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}
