import { useEffect } from 'react';
import JobApplicationList from './job-applications/JobApplicationList';

export default function JobApplications() {
  useEffect(() => {
    document.title = 'Job Applications | HR Management';
  }, []);
  return <JobApplicationList />;
}
