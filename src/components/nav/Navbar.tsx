import { NavLink } from "react-router";
import { auth } from "@/firebase";
import { Button } from "../ui/button";
import { ModeToggle } from "./mode-toggle";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <nav className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 md:gap-10 p-4 md:p-10 font-bold text-lg md:text-3xl">
      {/* Navigation Links */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-10">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "dark:bg-gray-500 bg-blue-400 p-2 rounded-md"
              : "p-2 rounded-md"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive
              ? "dark:bg-gray-500 bg-blue-400 p-2 rounded-md"
              : "p-2 rounded-md"
          }
        >
          Products
        </NavLink>
      </div>

      {/* User Links */}
      <div className="flex gap-4 md:gap-10 items-center w-full md:w-auto">
        {user ? (
          <div className="flex flex-col md:flex-row gap-2 md:gap-10 items-start md:items-center w-full md:w-auto">
            <div className="flex gap-2 md:gap-10">
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  isActive
                    ? "dark:bg-gray-500 bg-blue-400 p-2 rounded-md"
                    : "p-2 rounded-md"
                }
              >
                Favorites
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive
                    ? "dark:bg-gray-500 bg-blue-400 p-2 rounded-md"
                    : "p-2 rounded-md"
                }
              >
                Cart
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "dark:bg-gray-500 bg-blue-400 p-2 rounded-md"
                    : "p-2 rounded-md"
                }
              >
                Dashboard
              </NavLink>
            </div>

            <Button
              onClick={() => {
                auth.signOut();
              }}
              className="mt-2 md:mt-0"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 md:gap-10">
            <NavLink to="/auth/login">Login</NavLink>
            <NavLink to="/auth/register">Register</NavLink>
          </div>
        )}

        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
