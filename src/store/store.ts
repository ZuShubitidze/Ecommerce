import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "@/store/products/productsSlice";
import favoritesReducer from "@/store/favorites/favoritesSlice";
import cartReducer from "@/store/cart/cartSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
  },
  // devTools: process.env.NODE_ENV !== "production",
  devTools: { trace: true },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
