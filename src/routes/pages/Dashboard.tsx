import { auth } from "@/firebase";

const Dashboard = () => {
  const user = auth.currentUser;

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
    </div>
  );
};

export default Dashboard;
