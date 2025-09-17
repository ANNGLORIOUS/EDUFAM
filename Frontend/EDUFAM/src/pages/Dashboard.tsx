import { useAuth } from '../hooks/useAuth';
import AdminView from './dashboard/AdminView';
import ParentView from './dashboard/ParentView';
import TeacherView from './dashboard/TeacherView';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminView />;
      case 'TEACHER':
        return <TeacherView />;
      case 'PARENT':
        return <ParentView />;
      default:
        return (
          <div className="container mt-4">
            <h2>Welcome</h2>
            <p>Please sign in to see your dashboard.</p>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;
