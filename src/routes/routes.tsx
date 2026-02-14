import Root from "./root.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { createBrowserRouter } from "react-router";
import Register from "./pages/Register.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PaymentPage from "./pages/PaymentPage.tsx";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.tsx";
import { rootLoader } from "./rootLoader.ts";
import { loginAction } from "@/components/auth/auth.actions.ts";
import ProtectedRoute from "./ProtectedRoute.tsx";
import ErrorBoundary from "@/components/ErrorBoundary.tsx";
import React from "react";

const CartPage = React.lazy(() => import("./pages/CartPage.tsx"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage.tsx"));
const Contact = React.lazy(() => import("./pages/Contact.tsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    ErrorBoundary: () => <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <Contact /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Protected routes
          { path: "dashboard", element: <Dashboard /> },
          { path: "favorites", element: <FavoritesPage /> },
          { path: "cart", element: <CartPage /> },
        ],
      },
      { path: "cart/checkout", element: <PaymentPage /> },
      {
        path: "cart/checkout/order-confirmation",
        element: <OrderConfirmationPage />,
      },
      // Authentication routes
      {
        path: "auth",
        children: [
          { path: "login", element: <Login />, action: loginAction },
          { path: "register", element: <Register /> },
        ],
      },
    ],
  },
]);

export default router;
