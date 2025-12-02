import Root from "./root.tsx";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Login from "./pages/Login.tsx";
import { createBrowserRouter } from "react-router";
import Register from "./pages/Register.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import FavoritesPage from "./pages/FavoritesPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CartPage from "./pages/CartPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "dashboard", element: <Dashboard /> },
      {
        path: "auth",
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },
    ],
  },
]);

export default router;
