import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase"; // Assuming db is exported from src/firebase.ts or similar
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"; // Assuming Shadcn UI is used
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface OrderDocument extends DocumentData {
  amount: number;
  currency: string;
  created: {
    toDate: () => Date;
  };
  cartProducts: Array<{
    id: string;
    title: string;
    price: number;
    images?: string[];
    category?: string;
  }>;
  status?: string;
  error?: { message: string };
}

const OrderConfirmationPage: React.FC = () => {
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) return null;
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
    // This assumes the most recent payment document is the one we want to confirm.
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
            // If status is not yet 'succeeded' and no error, it might still be processing.
            // You could display a "Processing your order..." message here or assume success for now.
            // For this example, we'll show it, but in a real app, you might want to wait for "succeeded".
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <p className="text-red-500 font-semibold">Error: {error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <p className="text-gray-700">
          No order details available. It might still be processing, or you
          haven't placed an order yet.
        </p>
        <Link to="/" className="text-blue-600 hover:underline">
          Go to Home
        </Link>
      </div>
    );
  }

  // Format the date for display
  const orderDate = order.created?.toDate
    ? order.created.toDate().toLocaleString()
    : "N/A";

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-green-100 p-6 rounded-t-lg">
          <CardTitle className="text-3xl font-extrabold text-green-800 text-center">
            Order Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <p className="text-xl text-gray-800 text-center">
            Thank you for your purchase! Your order has been successfully
            placed.
          </p>
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <h4 className="text-2xl font-semibold mb-3 text-gray-900">
              Order Summary:
            </h4>
            <p className="text-gray-700">
              Order Date: <strong>{orderDate}</strong>
            </p>
            <p className="text-gray-700">
              Payment Status:{" "}
              <strong>
                {order.status
                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  : "Pending"}
              </strong>
            </p>

            <h5 className="text-xl font-medium mt-4 mb-2 text-gray-800">
              Items Purchased:
            </h5>
            {order.cartProducts && order.cartProducts.length > 0 ? (
              <ul className="list-disc list-inside pl-2 space-y-1 text-gray-700">
                {order.cartProducts.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="flex justify-between items-baseline"
                  >
                    <span>{item.title}</span>
                    <span className="font-medium">
                      {item.price.toFixed(2)} {order.currency}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 italic">
                No specific items found for this order.
              </p>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4 mt-4 text-right">
            <p className="text-2xl font-bold text-gray-900">
              Total Amount:{" "}
              <span className="text-blue-700">
                {(order.amount / 100).toFixed(2)} {order.currency}
              </span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 bg-gray-50 p-4 rounded-b-lg">
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Continue Shopping
          </Link>
          {/* My Orders */}
          {/* <Link to="/my-orders" className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300">
            View My Orders
          </Link> */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;
