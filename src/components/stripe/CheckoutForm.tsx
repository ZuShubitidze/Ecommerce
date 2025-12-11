import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db } from "@/firebase";
import { Field } from "../ui/field";
import { Button } from "../ui/button";
import { useAuth } from "@/routes/auth/AuthContext";
import { addDoc, collection, onSnapshot } from "firebase/firestore";

// Props
interface CheckoutFormProps {
  amount: number; // In cents
  currency: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  cartProducts: Array<any>;
}
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  cartProducts,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const user = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Ensure Stripe.js, Elements and user are available
    if (!stripe || !elements || !user) {
      setError(
        "Payment gateway not loaded or user not authenticated. Please try again."
      );
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card input not found.");
      setLoading(false);
      return;
    }

    // 1. Create a PaymentMethod from the CardElement
    const { error: createPaymentMethodError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    // Error
    if (createPaymentMethodError) {
      setError(
        createPaymentMethodError.message || "Failed to create payment method."
      );
      setLoading(false);
      return;
    }

    if (!paymentMethod) {
      setError("Payment method could not be created.");
      setLoading(false);
      return;
    }
    //

    // 2. Write payment details to Firestore to trigger the Stripe Payments extension
    try {
      const paymentsCollectionRef = collection(
        db,
        `stripe_customers/${user.user?.uid}/payments`
      );

      // Add a new document to the 'payments' subcollection
      const paymentDocRef = await addDoc(paymentsCollectionRef, {
        amount: amount,
        currency: currency,
        payment_method: paymentMethod.id, // ID of the PaymentMethod created by Stripe.js
        created: new Date(), // Timestamp for tracking
        cart_products: cartProducts, // Store cart products
      });

      console.log(
        "Payment initiation document written to Firestore with ID:",
        paymentDocRef.id
      );

      // 3. Listen for real-time updates on the Firestore document
      // The Stripe Payments extension will update this document with client_secret
      const unsubscribe = onSnapshot(paymentDocRef, async (snapshot) => {
        const paymentData = snapshot.data();

        // Check if the client_secret has been added by the extension
        if (paymentData && paymentData.client_secret && !paymentData.status) {
          console.log(
            "Client secret received from Firestore:",
            paymentData.client_secret
          );
          // Now, confirm the payment on the client side using the client_secret
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(paymentData.client_secret, {
              payment_method: paymentMethod.id, // Re-sue the PaymentMethod ID
            });
          if (confirmError) {
            console.error("Payment confirmation failed:", confirmError);
            setError(confirmError.message || "Payment confirmation failed.");
            setLoading(false);
            onPaymentError?.(
              confirmError.message || "Payment confirmation failed."
            );
            unsubscribe(); // Stop listening after an error
          } else if (paymentIntent?.status === "succeeded") {
            setSuccessMessage(
              "Payment successful! Thank you for your purchase."
            );
            console.log("Stripe PaymentIntent succeeded:", paymentIntent);
            setLoading(false);
            onPaymentSuccess?.();
            unsubscribe(); // Stop listening after success
          } else {
            // Handle other payment intent statuses (e.g., 'requires_action' for 3D Secure)
            // stripe.confirmCardPayment usually handles 3D Secure redirects/pop-ups,
            // but you might have specific UI logic for certain statuses.
            console.log("Stripe PaymentIntent status:", paymentIntent?.status);
            setSuccessMessage(
              `Payment status: ${paymentIntent?.status}. You might need to refresh or check your orders.`
            );
            setLoading(false);
            onPaymentSuccess?.(); // Or a custom handler for 'requires_action'
            unsubscribe();
          }
        } else if (paymentData && paymentData.status === "succeeded") {
          // If the extension directly marked it as succeeded without needing client_secret confirmation
          setSuccessMessage("Payment successful! Thank you for your purchase.");
          console.log(
            "Payment successful via Firestore status (no client_secret needed):",
            paymentData
          );
          setLoading(false);
          onPaymentSuccess?.();
          unsubscribe();
        } else if (paymentData && paymentData.error) {
          // If the extension encountered an error on the server side
          setError(
            paymentData.error.message || "Payment failed on the server."
          );
          console.error(
            "Server-side payment error from extension:",
            paymentData.error
          );
          setLoading(false);
          onPaymentError?.(
            paymentData.error.message || "Server-side payment failure."
          );
          unsubscribe();
        }
      });

      // It's good practice to clean up the listener if the component unmounts
      // before the payment process is complete (though the listener unsubscribes itself above).
      // useEffect(() => {
      //   return () => unsubscribe();
      // }, [unsubscribe]); // Depend on unsubscribe to re-run effect if it changes
    } catch (firestoreError: any) {
      setError(
        firestoreError.message ||
          "An error occurred while initiating payment in Firestore."
      );
      console.error(
        "Error writing payment document to Firestore:",
        firestoreError
      );
      setLoading(false);
      onPaymentError?.(firestoreError.message || "Error initiating payment.");
    }
  };

  return (
    <Field onSubmit={handleSubmit} className="flex w-150 mx-auto gap-10">
      <h3>Enter your card details</h3>
      <div>
        <CardElement />
      </div>

      <Button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </Button>

      {error && <div>{error}</div>}
      {successMessage && <div>{successMessage}</div>}
    </Field>
  );
};

export default CheckoutForm;
