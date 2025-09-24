import { createContext } from 'react';

export interface Feedback {
  concernType: string;
  message: string;
  requestCallback: boolean;
  scheduleMeeting: boolean;
  parentEmail: string;
}

export interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (feedback: Feedback) => void;
}

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);
