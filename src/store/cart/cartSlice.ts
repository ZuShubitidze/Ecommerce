import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FavoriteProductData } from "../favorites/interfaces/favorites.interface";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
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
  "cart/fetchCartSuccess"
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
    }
  );

  return unsubscribe;
};

// Thunk to add products to cart
export const addCartProductToFirestore =
  (userId: string, product: FavoriteProductData) => async () => {
    // Error
    if (!userId) {
      console.error("Can't add to cart: No user ID provided.");
      return;
    }
    if (!product) {
      console.error("Can't add to cart: Product is missing ID.");
      return;
    }

    const docId = String(product.id);
    console.log(userId);

    try {
      // Give location where to save cart products
      const cartProductDocRef = doc(db, `users/${userId}/cart`, docId);
      // Use setdoc to add/overwrite product to cart with product ID as doc ID
      await setDoc(cartProductDocRef, product);
      // The onSnapshot listener will automatically update the Redux state via subscribeToFavorites
      console.log(`Product ${product.id} added to Cart for user ${userId}`);
    } catch (error: any) {
      console.error("Error adding cart product to Firestore:", error);
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
        }
      )
      .addCase(fetchCartFailure, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
