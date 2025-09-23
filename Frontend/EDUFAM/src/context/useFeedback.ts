import { useContext } from 'react';
import { FeedbackContext } from './FeedbackContextObject';
import type { FeedbackContextType } from './FeedbackContextObject';

export function useFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
