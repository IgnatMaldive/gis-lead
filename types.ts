
export interface BusinessLead {
  id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total?: number;
  latitude: number;
  longitude: number;
  industry: string;
  marketGaps: string[];
  pitchAngle: string;
  verificationSource?: string;
  website?: string;
  // Advanced Filter Data
  hasChatbot: boolean;
  hasOnlineBooking: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SearchState {
  industry: string;
  location: string;
  minRating: number;
  maxRating: number;
  // Advanced Filter State
  filterChatbot?: boolean;
  filterBooking?: boolean;
  filterSentiment?: 'all' | 'positive' | 'neutral' | 'negative';
}

export interface CompetitorReport {
  competitorUrl: string;
  issues: string[];
  comparisonSummary: string;
  advantageLead: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
