import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const Dashboard = () => {
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
    </div>
  );
};

export default Dashboard;
