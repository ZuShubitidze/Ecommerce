import { db } from "@/firebase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import type { RootState } from "../store";

interface ProductState {
  products: any[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  lastVisible: null,
  hasMore: true,
  loading: false,
  error: null,
};

// 1. Initial Fetch Thunk
export const fetchInitialProducts = createAsyncThunk(
  "products/fetchInitialProducts",
  async (_, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "products"),
        orderBy("title"), // or "createdAt"
        limit(10),
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const lastVisible =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { products, lastVisible, hasMore: products.length === 10 };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// 2. Load More Thunk
export const fetchMoreProducts = createAsyncThunk(
  "products/fetchMoreProducts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const lastDoc = state.products.lastVisible;

      if (!lastDoc) return rejectWithValue("No more documents to fetch");

      const q = query(
        collection(db, "products"),
        orderBy("title"),
        startAfter(lastDoc),
        limit(10),
      );

      const querySnapshot = await getDocs(q);
      const nextProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const nextLastVisible =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return {
        products: nextProducts,
        lastVisible: nextLastVisible,
        hasMore: nextProducts.length === 10,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Initial Fetch
      .addCase(fetchInitialProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInitialProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchInitialProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // More Products
      .addCase(fetchMoreProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = [...state.products, ...action.payload.products];
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productsSlice.reducer;
