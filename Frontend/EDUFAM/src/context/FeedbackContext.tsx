import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Feedback {
  id: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentId: string;
  concernType: string;
  message: string;
  requestCallback: boolean;
  scheduleMeeting: boolean;
  timestamp: Date;
  status: 'new' | 'read' | 'responded';
}

interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => void;
  markAsRead: (id: string) => void;
  markAsResponded: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const addFeedback = (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'new'
    };
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  const markAsRead = (id: string) => {
    setFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === id ? { ...feedback, status: 'read' } : feedback
      )
    );
  };

  const markAsResponded = (id: string) => {
    setFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === id ? { ...feedback, status: 'responded' } : feedback
      )
    );
  };

  return (
    <FeedbackContext.Provider value={{ feedbacks, addFeedback, markAsRead, markAsResponded }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
