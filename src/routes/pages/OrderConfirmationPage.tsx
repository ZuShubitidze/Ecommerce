import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import OrderConfirmationComponent, {
  type OrderDocument,
} from "@/components/OrderConfirmationComponent";

export const OrderConfirmationPage: React.FC = () => {
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) {
    return <div>Loading...</div>;
  }

  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // User not logged in, redirect to login or show a message
      console.warn("User not authenticated. Redirecting to login.");
      navigate("/auth/login");
      return;
    }

    setLoading(true);
    setError(null);

    // Query for the latest successfully completed payment document for the current user
    const paymentsCollectionRef = collection(
      db,
      `stripe_customers/${user.uid}/payments`,
    );

    // Order by 'created' timestamp in descending order and take the first one
    const q = query(
      paymentsCollectionRef,
      orderBy("created", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const latestOrderDoc = querySnapshot.docs[0];
          const orderData = latestOrderDoc.data() as OrderDocument;

          // Check for a 'succeeded' status, as updated by the Stripe Payments extension
          if (orderData.status === "succeeded") {
            setOrder(orderData);
          } else if (orderData.error) {
            setError(
              orderData.error.message || "Payment failed for the last order.",
            );
          } else {
            setOrder(orderData);
            console.log(
              "Order found, but status is not 'succeeded' yet or is pending. Current status:",
              orderData.status,
            );
          }
        } else {
          setError("No recent order found for your account.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order:", err);
        setError(
          "Failed to load order details. Please check your internet connection.",
        );
        setLoading(false);
      },
    );

    return () => unsubscribe(); // Cleanup the Firestore listener when the component unmounts
  }, [user, navigate]);

  return (
    <OrderConfirmationComponent order={order} loading={loading} error={error} />
  );
};

export default OrderConfirmationPage;
