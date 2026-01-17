import { useEffect } from 'react';
import EmployeeList from './employees/EmployeeList';

export default function Employees() {
  useEffect(() => {
    document.title = 'Employees | HR Management';
  }, []);
  return <EmployeeList />;
}
