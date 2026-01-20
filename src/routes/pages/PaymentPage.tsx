import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/stripe/CheckoutForm";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartError,
  selectCartLoading,
  selectCartProducts,
  selectCartTotal,
  subscribeToCart,
} from "@/store/cart/cartSlice";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { RootState } from "@/store/store";

const stripePromise = loadStripe(
  "pk_test_51RLeip01iZRBFKlPw4RTYyeeUAMLIzKUp38vfXFFH5pTRDZQ0rNJOWdWeBRaJVyPWT7JvNpyy01rNZ4e1yawekgt00httHa3Zg",
);

const PaymentPage = () => {
  // const { user } = useAuth();
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) return null;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Cart
  const { totalAmount, currency } = useSelector(selectCartTotal);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const cartProducts = useSelector(selectCartProducts);

  // Subscribe to cart changes on component mount or user changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user?.uid) {
      unsubscribe = dispatch(subscribeToCart(user.uid) as any);
    }
    // Cleanup on unmount or user logout
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, user?.uid]);

  const handlePaymentSuccess = () => {
    console.log("Payment was successful! Redirecting to order confirmation...");
    navigate("/cart/checkout/order-confirmation");
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    <div>
      Error occured, {error}.<Link to={"/"}>Go back home</Link>
    </div>;
  };

  if (!stripePromise) {
    return <div>Loading payment gateway...</div>;
  }

  if (loading) {
    return <div>Loading your cart details...</div>;
  }

  if (error) {
    return <div>Error loading cart: {error}. Please try again.</div>;
  }

  if (!user) {
    return (
      <div>
        <Link to={"/auth/login"}>Please log in to proceed with payment.</Link>
      </div>
    );
  }

  if (cartProducts.length === 0 || totalAmount === 0) {
    return (
      <div>
        Your cart is empty. Please add items to your cart before proceeding to
        checkout.
      </div>
    );
  }

  // Stripe requires the amount in the smallest currency unit (e.g., cents for USD)
  const amountInSmallestUnit = Math.round(totalAmount * 100);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amountInSmallestUnit}
        currency={currency}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        cartProducts={cartProducts}
      />
    </Elements>
  );
};

export default PaymentPage;
