import { useEffect } from 'react';
import JobOfferList from './job-offers/JobOfferList';

export default function JobOffers() {
  useEffect(() => {
    document.title = 'Job Offers | HR Management';
  }, []);
  return <JobOfferList />;
}
