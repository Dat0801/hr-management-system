import { useEffect } from 'react';
import InterviewList from './interviews/InterviewList';

export default function Interviews() {
  useEffect(() => {
    document.title = 'Interviews | HR Management';
  }, []);
  return <InterviewList />;
}
