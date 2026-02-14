import { Outlet } from "react-router";
import Navbar from "../components/nav/Navbar";
import Footer from "./pages/Footer";
import type { AppDispatch, RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { useEffect, useRef } from "react";
import { subscribeToProducts } from "@/store/products/actions";
import { useSelector } from "react-redux";
import { Spinner } from "@/components/ui/spinner";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import {
  clearFavorites,
  subscribeToFavorites,
} from "@/store/favorites/favoritesSlice";
import { clearCart, subscribeToCart } from "@/store/cart/cartSlice";

const Root = () => {
  const { initialized } = useSelector((state: RootState) => state.auth);

  const dispatch = useAppDispatch<AppDispatch>();
  const unsubscribeProductsRef = useRef<(() => void) | null>(null);
  const favoritesUnsubscribeRef = useRef<(() => void) | null>(null); // New ref for favorites
  const cartUnsubscribeRef = useRef<(() => void) | null>(null);

  const { loading: productsLoading, error: productsError } = useSelector(
    (state: RootState) => state.products,
  );

  // Only subscribe to products once when the app mounts
  useEffect(() => {
    const unsubscribe = dispatch(subscribeToProducts());
    unsubscribeProductsRef.current = unsubscribe;

    return () => {
      if (unsubscribeProductsRef.current) {
        console.log("Unsubscribing from products listener (App cleanup)");
        unsubscribeProductsRef.current();
      }
    };
  }, [dispatch]); // Runs only once when the App component mounts

  // Effect for Firebase Auth state and Favorites Subscription
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.uid : "None"); // For debugging
      // Favorites Subscription
      // Clean up any existing favorites listener
      if (favoritesUnsubscribeRef.current) {
        favoritesUnsubscribeRef.current();
        favoritesUnsubscribeRef.current = null;
      }
      if (user) {
        // User logged in, start favorites subscription
        const unsubscribeFavorites = dispatch(subscribeToFavorites(user.uid));
        favoritesUnsubscribeRef.current = unsubscribeFavorites;
      } else {
        // User logged out, clear favorites from Redux
        dispatch(clearFavorites());
      }
      // Cart Subscription
      if (cartUnsubscribeRef.current) {
        cartUnsubscribeRef.current();
        cartUnsubscribeRef.current = null;
      }
      if (user) {
        const unsubscribeCart = dispatch(subscribeToCart(user.uid));
        cartUnsubscribeRef.current = unsubscribeCart;
      } else {
        dispatch(clearCart());
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up auth listener and all Firebase subscriptions.");
      authUnsubscribe(); // Unsubscribe from Firebase Auth listener
      if (favoritesUnsubscribeRef.current) {
        favoritesUnsubscribeRef.current(); // Unsubscribe from Favorites
        favoritesUnsubscribeRef.current = null;
      }
      if (cartUnsubscribeRef.current) {
        cartUnsubscribeRef.current(); // Unsubscribe from Cart
        cartUnsubscribeRef.current = null;
      }
    };
  }, [dispatch]);

  // Global loading state
  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="size-10" />
        <p>Loading products...</p>
      </div>
    );
  }

  // Handle a global error, maybe a full-page error message
  if (productsError) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-700">
        <p>
          Error loading application data: {productsError}. Please try again
          later.
        </p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Initializing...</p>
      </div>
    );
  }

  return (
    // App Container
    <div className="min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto">
        <Outlet />
      </main>

      <footer className="py-4 mt-6 text-center text-sm">
        <Footer />
      </footer>
    </div>
  );
};

export default Root;
