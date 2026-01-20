// src/store/products/productsSlice.ts

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentSnapshot, // Keep this import
} from "firebase/firestore";
import type { Product } from "@/store/products/interfaces/product.interface";
import { db } from "@/firebase";

interface ProductsState {
  products: Product[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  hasMore: true,
  loading: false,
  error: null,
};

const PRODUCTS_PER_PAGE = 12;

export const fetchInitialProducts = createAsyncThunk(
  "products/fetchInitial",
  async (_, { rejectWithValue }) => {
    try {
      const productsCollectionRef = collection(db, "products");
      const q = query(
        productsCollectionRef,
        orderBy("title"),
        limit(PRODUCTS_PER_PAGE)
      );

      const documentSnapshots = await getDocs(q);
      const products: Product[] = [];
      documentSnapshots.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;
      const hasMore = documentSnapshots.docs.length === PRODUCTS_PER_PAGE;

      // Ensure lastVisible is returned here, it will be in the action.payload
      return { products, hasMore, lastVisible };
    } catch (error: any) {
      console.error("Error fetching initial products:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMoreProducts = createAsyncThunk(
  "products/fetchMore",
  async (lastDoc: DocumentSnapshot, { rejectWithValue }) => {
    try {
      const productsCollectionRef = collection(db, "products");
      const q = query(
        productsCollectionRef,
        orderBy("title"),
        startAfter(lastDoc),
        limit(PRODUCTS_PER_PAGE)
      );

      const documentSnapshots = await getDocs(q);
      const newProducts: Product[] = [];
      documentSnapshots.forEach((doc) => {
        newProducts.push({ id: doc.id, ...doc.data() } as Product);
      });

      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;
      const hasMore = documentSnapshots.docs.length === PRODUCTS_PER_PAGE;

      // Ensure lastVisible is returned here, it will be in the action.payload
      return { products: newProducts, hasMore, lastVisible };
    } catch (error: any) {
      console.error("Error fetching more products:", error);
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInitialProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[];
            hasMore: boolean;
            // Add lastVisible back to PayloadAction type for type safety in reducer
            lastVisible: DocumentSnapshot | null;
          }>
        ) => {
          state.loading = false;
          state.products = action.payload.products;
          state.hasMore = action.payload.hasMore;
          // IMPORTANT: Still NO ASSIGNMENT to state.lastVisibleDoc
        }
      )
      .addCase(fetchInitialProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMoreProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMoreProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[];
            hasMore: boolean;
            // Add lastVisible back to PayloadAction type for type safety in reducer
            lastVisible: DocumentSnapshot | null;
          }>
        ) => {
          state.loading = false;
          state.products = [...state.products, ...action.payload.products];
          state.hasMore = action.payload.hasMore;
          // IMPORTANT: Still NO ASSIGNMENT to state.lastVisibleDoc
        }
      )
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productsSlice.reducer;
