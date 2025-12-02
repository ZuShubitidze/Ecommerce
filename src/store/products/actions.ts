import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase"; // Your firebase initialization file

// Action types
export const FETCH_PRODUCTS_REQUEST = "FETCH_PRODUCTS_REQUEST";
export const FETCH_PRODUCTS_SUCCESS = "FETCH_PRODUCTS_SUCCESS";
export const FETCH_PRODUCTS_FAILURE = "FETCH_PRODUCTS_FAILURE";

// This action will set up the listener and return the unsubscribe function
export const subscribeToProducts = () => (dispatch: any) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });

  // Create a query for your products collection
  const q = query(collection(db, "products"), orderBy("title"));

  // Set up the real-time listener
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const products: DocumentData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: FETCH_PRODUCTS_SUCCESS, payload: products });
    },
    (error) => {
      console.error("Error subscribing to products:", error);
      dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: error.message });
    }
  );

  // Return the unsubscribe function so it can be called later
  return unsubscribe;
};
