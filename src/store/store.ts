import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "@/store/products/productsSlice";
import favoritesReducer from "@/store/favorites/favoritesSlice";
import cartReducer from "@/store/cart/cartSlice";
import authReducer from "@/features/auth/authSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    auth: authReducer,
  },
  // devTools: process.env.NODE_ENV !== "production",
  devTools: { trace: true },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific actions that contain non-serializable values in their payload
        ignoredActions: [
          "products/fetchInitial/fulfilled",
          "products/fetchMore/fulfilled",
        ],
        // Ignore specific paths within actions or state
        // The error message specifies `payload.lastVisible`
        ignoredPaths: [
          "payload.lastVisible", // This tells the middleware to ignore this path in action payloads
        ],
        // If you were storing `lastVisibleDoc` in the Redux state, you'd also ignore paths like:
        // "products.lastVisibleDoc"
      },
    }),
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
