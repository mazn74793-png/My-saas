import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp | Date;
  connectedPages?: ConnectedPage[];
}

export interface ConnectedPage {
  id: string;
  name: string;
  platform: "facebook" | "instagram";
  isConnected: boolean;
  username?: string;
  category?: string;
  avatarUrl?: string;
}

export interface KnowledgeBaseData {
  userId: string;
  kbProducts: string;
  kbPricing: string;
  kbShipping: string;
  dialect: "egyptian" | "standard";
  updatedAt: Timestamp | Date;
}

export interface MessageLog {
  id?: string;
  userId: string;
  customerName: string;
  messageText: string;
  commentReply: string; // empty if triggered by DM
  dmReply: string;
  platform: "facebook" | "instagram";
  triggerType: "comment" | "dm";
  status: "sent" | "failed";
  timestamp: Timestamp | Date;
}

export interface AnalyticsStats {
  totalReplies: number;
  totalComments: number;
  totalDms: number;
  newCustomersCount: number;
}
