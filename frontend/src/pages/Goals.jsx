import { useEffect } from 'react';
import GoalList from './goals/GoalList';

export default function Goals() {
  useEffect(() => {
    document.title = 'Goals Management | HR Management';
  }, []);
  return <GoalList />;
}
