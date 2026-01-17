import { useEffect } from 'react';
import DepartmentList from './departments/DepartmentList';

export default function Departments() {
  useEffect(() => {
    document.title = 'Departments | HR Management';
  }, []);
  return <DepartmentList />;
}
