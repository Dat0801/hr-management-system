import { useEffect } from 'react';
import PayrollList from './payroll/PayrollList';

export default function Payroll() {
  useEffect(() => {
    document.title = 'Payroll | HR Management';
  }, []);
  return <PayrollList />;
}
