import { useEffect } from 'react';
import PerformanceReviewList from './performance-reviews/PerformanceReviewList';

export default function PerformanceReviews() {
  useEffect(() => {
    document.title = 'Performance Reviews | HR Management';
  }, []);
  return <PerformanceReviewList />;
}
