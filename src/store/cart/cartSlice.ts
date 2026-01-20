import {
  createAction,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FavoriteProductData } from "../favorites/interfaces/favorites.interface";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

// Cart initialState props
interface CartState {
  cartProducts: FavoriteProductData[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CartState = {
  cartProducts: [],
  loading: true,
  error: null,
};

// These actions will be dispatched by our thunks that interact with Firestore.
export const fetchCartRequest = createAction("cart/fetchCartRequest");
export const fetchCartSuccess = createAction<FavoriteProductData[]>(
  "cart/fetchCartSuccess",
);
export const fetchCartFailure = createAction<string>("cart/fetchCartFailure");

export const subscribeToCart = (userId: string) => (dispatch: any) => {
  if (!userId) {
    dispatch(clearCart());
    console.warn("No user ID provided. Clearing cart");
    return () => {}; // Return a dummy
  }
  // If user is present
  // Dispatch fetch request
  dispatch(fetchCartRequest());
  // Query data
  const cartCollectionRef = collection(db, `users/${userId}/cart`);
  const q = query(cartCollectionRef);

  const unsubscribe = onSnapshot(
    q,
    // Success
    (querySnapshot) => {
      const cart: FavoriteProductData[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as FavoriteProductData),
        id: doc.id,
      }));
      dispatch(fetchCartSuccess(cart));
    },
    // Failure
    (error: any) => {
      console.log("Error subscribing to cart", error);
      dispatch(fetchCartFailure(error.message));
    },
  );

  return unsubscribe;
};

// Thunk to add products to cart
export const addCartProductToFirestore =
  (userId: string, product: FavoriteProductData) => async () => {
    if (!userId) {
      console.error("Can't add to cart: No user ID provided.");
      return;
    }
    if (!product || !product.id) {
      console.error("Can't add to cart: Product is missing ID.");
      return;
    }

    const docId = String(product.id);
    const cartProductDocRef = doc(db, `users/${userId}/cart`, docId);

    try {
      const docSnap = await getDoc(cartProductDocRef);

      if (docSnap.exists()) {
        // Product already in cart, increment quantity
        const existingData = docSnap.data() as FavoriteProductData;
        const newQuantity = (existingData.quantity || 1) + 1; // Default to 1 if quantity was somehow missing
        await updateDoc(cartProductDocRef, { quantity: newQuantity });
        console.log(
          `Quantity for product ${product.id} incremented to ${newQuantity} for user ${userId}`,
        );
      } else {
        // Product not in cart, add it with quantity 1
        await setDoc(cartProductDocRef, { ...product, quantity: 1 });
        console.log(
          `Product ${product.id} added to Cart with quantity 1 for user ${userId}`,
        );
      }
      // The onSnapshot listener will automatically update the Redux state
    } catch (error: any) {
      console.error("Error adding/updating cart product in Firestore:", error);
    }
  };

// Thunk to directly update a product's quantity in the cart
export const updateCartProductQuantityInFirestore =
  (userId: string, productId: string, newQuantity: number) => async () => {
    if (!userId) {
      console.error("Can't update quantity: No user ID provided.");
      return;
    }
    if (!productId) {
      console.error("Can't update quantity: Product ID is missing.");
      return;
    }

    const cartProductDocRef = doc(db, `users/${userId}/cart`, productId);

    try {
      if (newQuantity <= 0) {
        // If quantity is 0 or less, remove the item from the cart
        await deleteDoc(cartProductDocRef);
        console.log(
          `Product ${productId} removed from Cart for user ${userId} due to quantity <= 0.`,
        );
      } else {
        // Otherwise, update the quantity
        await updateDoc(cartProductDocRef, { quantity: newQuantity });
        console.log(
          `Quantity for product ${productId} updated to ${newQuantity} for user ${userId}`,
        );
      }
      // The onSnapshot listener will automatically update the Redux state
    } catch (error: any) {
      console.error(
        "Error updating cart product quantity in Firestore:",
        error,
      );
    }
  };

// Thunk to remove product from cart
export const removeCartProductFromFirestore =
  (userId: string, productId: string) => async () => {
    // Error
    if (!userId) {
      console.error("Can't remove product: No user ID provided");
      return;
    }

    const docId = String(productId);

    try {
      // Query product you want to delete
      const cartProductDocRef = doc(db, `users/${userId}/cart`, docId);
      await deleteDoc(cartProductDocRef);
      // The onSnapshot listener will automatically update the Redux state via subscribeToFavorites
      console.log(`Product ${productId} removed from Cart for user ${userId}`);
    } catch (error: any) {
      console.log("Error removing cart product from Firestore:", error);
    }
  };

// Thunk to clear the entire cart in Firestore
export const clearCartInFirestore =
  (userId: string) => async (dispatch: any) => {
    if (!userId) {
      console.error("Can't clear cart: No user ID provided.");
      // Optionally, clear local Redux state if no user to prevent stale data
      dispatch(clearCart()); // Assuming clearCart is accessible here, or import it.
      return;
    }

    const cartCollectionRef = collection(db, `users/${userId}/cart`);
    try {
      // Get all documents in the subcollection
      const querySnapshot = await getDocs(cartCollectionRef);
      const deletePromises: Promise<void>[] = [];

      querySnapshot.forEach((docRef) => {
        deletePromises.push(deleteDoc(docRef.ref));
      });

      await Promise.all(deletePromises);
      console.log(
        `All items cleared from cart for user ${userId} in Firestore.`,
      );
      // The onSnapshot listener (from subscribeToCart) will automatically update
      // the Redux state because all documents have been deleted in Firestore.
    } catch (error: any) {
      console.error("Error clearing cart in Firestore:", error);
      // Optionally, you could dispatch an error action here
    }
  };

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  // Clear cart state, for example, if user isn't present
  reducers: {
    clearCart: (state) => {
      state.cartProducts = [];
      state.loading = false;
      state.error = null;
    },
    // Update quantity
    updateCartProductQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const product = state.cartProducts.find((item) => item.id === productId);
      if (product) {
        product.quantity = quantity;
      }
    },
  },
  // Redux thunk
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartRequest, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCartSuccess,
        (state, action: PayloadAction<FavoriteProductData[]>) => {
          state.loading = false;
          state.cartProducts = action.payload;
        },
      )
      .addCase(fetchCartFailure, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;

// Selectors
export const selectCartProducts = (state: { cart: CartState }) =>
  state.cart.cartProducts;
export const selectCartLoading = (state: { cart: CartState }) =>
  state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;

// Calculate total amount and currency
export const selectCartTotal = createSelector(
  [selectCartProducts], // Array of input selectors (what this selector depends on)
  (cartProducts) => {
    // The "result function" - only runs if cartProducts changes
    let totalAmount = 0;
    cartProducts.forEach((product) => {
      const quantity =
        product.quantity && product.quantity > 0 ? product.quantity : 1;
      totalAmount += product.price * quantity;
    });

    const currency = "usd"; // Or dynamically determined if your app supports it

    // This object is only created and returned if cartProducts actually changed
    return {
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      currency,
    };
  },
);

export default cartSlice.reducer;
