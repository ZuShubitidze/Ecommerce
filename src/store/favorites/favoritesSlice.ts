import {
  createSlice,
  createAction,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { FavoriteProductData } from "./interfaces/favorites.interface";
// Favorites slice state interface
interface FavoritesState {
  favorites: FavoriteProductData[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};

// These actions will be dispatched by our thunks that interact with Firestore.
export const fetchFavoritesRequest = createAction(
  "favorites/fetchFavoritesRequest",
);
export const fetchFavoritesSuccess = createAction<FavoriteProductData[]>(
  "favorites/fetchFavoritesSuccess",
);
export const fetchFavoritesFailure = createAction<string>(
  "favorites/fetchFavoritesFailure",
);

// Async Thunks for Firestore Interaction
export const subscribeToFavorites = (userId: string) => (dispatch: any) => {
  if (!userId) {
    // If no user ID, clear favorites and return a no-op unsubscribe
    dispatch(clearFavorites());
    console.warn(
      "No user ID provided for favorites subscription. Clearing favorites.",
    );
    return () => {}; // Return a dummy unsubscribe function
  }
  // If user is present
  dispatch(fetchFavoritesRequest());

  const favoritesCollectionRef = collection(db, `users/${userId}/favorites`);
  const q = query(favoritesCollectionRef);

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const favorites: FavoriteProductData[] = querySnapshot.docs.map(
        (doc) => ({
          ...(doc.data() as FavoriteProductData), // Cast to FavoriteProductData interface
          id: doc.id, // Assuming doc.id is the product ID
        }),
      );
      dispatch(fetchFavoritesSuccess(favorites));
    },
    (error: any) => {
      console.error("Error subscribing to favorites:", error);
      dispatch(fetchFavoritesFailure(error.message));
    },
  );

  return unsubscribe;
};

// Add a product to a user's favorites in Firestore
export const addFavoriteToFirestore =
  (userId: string, product: FavoriteProductData) => async () => {
    if (!userId) {
      console.error("Cannot add favorite: No user ID provided.");
      return;
    }
    if (!product.id) {
      console.error("Cannot add favorite: Product is missing an ID.");
      return;
    }

    const docId = String(product.id);

    try {
      const favoriteDocRef = doc(db, `users/${userId}/favorites`, docId);
      // Use setDoc to add/overwrite the favorite using the product's ID as the doc ID
      await setDoc(favoriteDocRef, product);
      // The onSnapshot listener will automatically update the Redux state via subscribeToFavorites
      console.log(
        `Product ${product.id} added to favorites for user ${userId}`,
      );
    } catch (error: any) {
      console.error("Error adding favorite to Firestore:", error);
    }
  };

//  Thunk to remove a product from a user's favorites in Firestore
export const removeFavoriteFromFirestore =
  (userId: string, productId: string) => async () => {
    if (!userId) {
      console.error("Cannot remove favorite: No user ID provided.");
      return;
    }

    const docId = String(productId);

    try {
      const favoriteDocRef = doc(db, `users/${userId}/favorites`, docId);
      await deleteDoc(favoriteDocRef);
      // The onSnapshot listener will automatically update the Redux state via subscribeToFavorites
      console.log(
        `Product ${productId} removed from favorites for user ${userId}`,
      );
    } catch (error: any) {
      console.error("Error removing favorite from Firestore:", error);
    }
  };

// --- Favorites Slice Definition ---
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // We keep clearFavorites here as it's a simple, synchronous state reset
    clearFavorites: (state) => {
      state.favorites = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoritesRequest, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFavoritesSuccess,
        (state, action: PayloadAction<FavoriteProductData[]>) => {
          state.loading = false;
          state.favorites = action.payload;
        },
      )
      .addCase(
        fetchFavoritesFailure,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearFavorites } = favoritesSlice.actions; // Export for direct dispatch if needed
export default favoritesSlice.reducer;
