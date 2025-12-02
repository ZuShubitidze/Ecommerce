import { NavLink } from "react-router";
import { ModeToggle } from "./mode-toggle";
import { auth } from "@/firebase";
import { useAuth } from "@/routes/auth/AuthContext";
import { Button } from "./button";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="flex gap-10 items-center p-10 font-bold md:text-3xl">
      {/* Navigation Links */}
      <div className="flex gap-10 md:gap-20">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
      </div>

      {/* User Links */}
      <div className="ml-auto flex gap-10 md:gap-20 items-center">
        {user ? (
          // Logged-in User Links
          <div className="flex gap-10 md:gap-20 items-center">
            <NavLink to="/favorites">Favorites</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <Button
              onClick={() => {
                auth.signOut();
              }}
            >
              Logout
            </Button>
          </div>
        ) : (
          // Guest User Links
          <>
            <NavLink to="/auth/login">Login</NavLink>
            <NavLink to="/auth/register">Register</NavLink>
          </>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
