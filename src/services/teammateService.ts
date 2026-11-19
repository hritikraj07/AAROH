import { User } from '../types';

export interface TeammateInvite {
  id: string;
  senderId: string;
  senderName: string;
  senderRoll?: string;
  senderEmail: string;
  senderProgram?: string;
  receiverId: string;
  receiverName: string;
  receiverRoll?: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ConnectedTeammate {
  id: string;
  userId: string;
  peerId: string;
  peerName: string;
  peerRoll?: string;
  peerEmail: string;
  peerProgram?: string;
  connectedAt: string;
}

const INVITES_KEY = 'aaroh_teammate_invites';
const CONNECTED_KEY = 'aaroh_connected_teammates';

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('aaroh_teammates_updated'));
  }
};

export const teammateService = {
  getInvites: (): TeammateInvite[] => {
    try {
      const raw = localStorage.getItem(INVITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getConnectedTeammates: (userId: string): ConnectedTeammate[] => {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(CONNECTED_KEY);
      const all: ConnectedTeammate[] = raw ? JSON.parse(raw) : [];
      return all.filter(c => c.userId === userId);
    } catch {
      return [];
    }
  },

  isTeammateConnected: (userId: string, peerId: string): boolean => {
    if (!userId || !peerId) return false;
    const teammates = teammateService.getConnectedTeammates(userId);
    return teammates.some(t => t.peerId === peerId);
  },

  hasPendingInvite: (senderId: string, receiverId: string): boolean => {
    if (!senderId || !receiverId) return false;
    const invites = teammateService.getInvites();
    return invites.some(
      inv =>
        inv.senderId === senderId &&
        inv.receiverId === receiverId &&
        inv.status === 'pending'
    );
  },

  sendInvite: (sender: User, peer: User): TeammateInvite => {
    const invites = teammateService.getInvites();

    // Check if pending already exists
    const existing = invites.find(
      inv =>
        inv.senderId === sender.id &&
        inv.receiverId === peer.id &&
        inv.status === 'pending'
    );
    if (existing) return existing;

    const newInvite: TeammateInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderRoll: sender.rollNumber,
      senderEmail: sender.email,
      senderProgram: sender.program,
      receiverId: peer.id,
      receiverName: peer.name,
      receiverRoll: peer.rollNumber,
      receiverEmail: peer.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(INVITES_KEY, JSON.stringify([newInvite, ...invites]));
    notifyUpdate();
    return newInvite;
  },

  acceptInvite: (inviteId: string): boolean => {
    const invites = teammateService.getInvites();
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return false;

    // Update invite status
    invite.status = 'accepted';
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));

    // Add reciprocal connected teammate entries
    const raw = localStorage.getItem(CONNECTED_KEY);
    const connected: ConnectedTeammate[] = raw ? JSON.parse(raw) : [];

    const now = new Date().toISOString();

    // Sender's view of receiver
    if (!connected.some(c => c.userId === invite.senderId && c.peerId === invite.receiverId)) {
      connected.push({
        id: `conn_${Date.now()}_1`,
        userId: invite.senderId,
        peerId: invite.receiverId,
        peerName: invite.receiverName,
        peerRoll: invite.receiverRoll,
        peerEmail: invite.receiverEmail,
        connectedAt: now,
      });
    }

    // Receiver's view of sender
    if (!connected.some(c => c.userId === invite.receiverId && c.peerId === invite.senderId)) {
      connected.push({
        id: `conn_${Date.now()}_2`,
        userId: invite.receiverId,
        peerId: invite.senderId,
        peerName: invite.senderName,
        peerRoll: invite.senderRoll,
        peerEmail: invite.senderEmail,
        peerProgram: invite.senderProgram,
        connectedAt: now,
      });
    }

    localStorage.setItem(CONNECTED_KEY, JSON.stringify(connected));
    notifyUpdate();
    return true;
  },

  declineInvite: (inviteId: string): boolean => {
    const invites = teammateService.getInvites();
    const updated = invites.filter(i => i.id !== inviteId);
    localStorage.setItem(INVITES_KEY, JSON.stringify(updated));
    notifyUpdate();
    return true;
  },

  removeTeammate: (userId: string, peerId: string): boolean => {
    if (!userId || !peerId) return false;

    // Remove reciprocal entries from connected teammates
    const raw = localStorage.getItem(CONNECTED_KEY);
    const connected: ConnectedTeammate[] = raw ? JSON.parse(raw) : [];
    const updated = connected.filter(
      c => !(c.userId === userId && c.peerId === peerId) && !(c.userId === peerId && c.peerId === userId)
    );
    localStorage.setItem(CONNECTED_KEY, JSON.stringify(updated));

    // Remove/reset any invites between them
    const invites = teammateService.getInvites();
    const updatedInvites = invites.filter(
      i => !(i.senderId === userId && i.receiverId === peerId) && !(i.senderId === peerId && i.receiverId === userId)
    );
    localStorage.setItem(INVITES_KEY, JSON.stringify(updatedInvites));

    notifyUpdate();
    return true;
  },
};
