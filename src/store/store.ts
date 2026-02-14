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
        // 1. Ignore the action payloads that carry the snapshot
        ignoredActions: [
          "products/fetchInitialProducts/fulfilled",
          "products/fetchMoreProducts/fulfilled",
        ],
        // 2. Ignore the specific path in the action payload
        ignoredActionPaths: ["payload.lastVisible"],
        // 3. Ignore the path in the Redux state where the snapshot lives
        ignoredPaths: ["products.lastVisible"],
      },
    }),
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
