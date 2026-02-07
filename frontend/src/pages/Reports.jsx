import { useEffect } from 'react';
import ReportsList from './reports/ReportsList';

export default function Reports() {
  useEffect(() => {
    document.title = 'Reports & Analytics | HR Management';
  }, []);
  return <ReportsList />;
}
