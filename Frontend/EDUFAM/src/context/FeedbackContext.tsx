

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import seedData from '../data/seed_data.json';
import { FeedbackContext } from './FeedbackContextObject';
import type { Feedback } from './FeedbackContextObject';

function isFeedbackArray(arr: unknown): arr is Feedback[] {
  return Array.isArray(arr) && arr.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Feedback).concernType === 'string' &&
      typeof (item as Feedback).message === 'string' &&
      typeof (item as Feedback).requestCallback === 'boolean' &&
      typeof (item as Feedback).scheduleMeeting === 'boolean'
  );
}




export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Load feedbacks from localStorage or seed data on mount

  // Helper to load feedbacks from localStorage or seed
  const loadFeedbacks = () => {
    const local = localStorage.getItem('edufam_feedbacks');
    if (!local || local === '[]') {
      // Only seed if key is missing or empty
      const seed = (seedData as { feedback?: unknown }).feedback;
      if (isFeedbackArray(seed)) {
        localStorage.setItem('edufam_feedbacks', JSON.stringify(seed));
        setFeedbacks(seed);
        return;
      }
      setFeedbacks([]);
      return;
    }
    try {
      const parsed = JSON.parse(local);
      if (isFeedbackArray(parsed)) {
        setFeedbacks(parsed);
        return;
      }
    } catch {
      // Ignore JSON parse errors and fallback to empty
    }
    setFeedbacks([]);
  };

  useEffect(() => {
    loadFeedbacks();

    // Listen for localStorage changes (cross-tab and in-app)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'edufam_feedbacks') {
        loadFeedbacks();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);


  // Save feedbacks to localStorage whenever they change, but never overwrite with empty array
  useEffect(() => {
    if (feedbacks && feedbacks.length > 0) {
      localStorage.setItem('edufam_feedbacks', JSON.stringify(feedbacks));
    }
  }, [feedbacks]);

  const addFeedback = (feedback: Feedback) => {
    console.log('[EDUFAM] addFeedback called with:', feedback);
    setFeedbacks(prev => {
      const updated = [...prev, feedback];
      console.log('[EDUFAM] feedbacks state updated:', updated);
      return updated;
    });
  };

  return (
    <FeedbackContext.Provider value={{ feedbacks, addFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};



