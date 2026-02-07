import { useEffect } from 'react';
import JobPositionList from './job-positions/JobPositionList';

export default function JobPositions() {
  useEffect(() => {
    document.title = 'Job Positions | HR Management';
  }, []);
  return <JobPositionList />;
}
