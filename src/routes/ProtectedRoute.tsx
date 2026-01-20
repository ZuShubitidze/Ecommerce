import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const ProtectedRoute = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default ProtectedRoute;
