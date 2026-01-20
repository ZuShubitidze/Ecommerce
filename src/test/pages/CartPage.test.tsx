import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

/**
 * Updated CartPage test
 *
 * Key fixes:
 * - vi.mock factories must be hoist-safe. The auth mock no longer closes over a top-level
 *   test variable; instead it keeps an internal _user and exposes __setMockUser helper.
 * - Tests use dynamic import (await import(...)) to call the helper at runtime so Vitest's
 *   hoisted mocks are respected in the ESM environment.
 * - Tests set the mock user BEFORE rendering the component.
 */

vi.mock("@/routes/auth/AuthContext", () => {
  // hoist-safe internal state and setter
  let _user: { uid?: string; email?: string } | null = null;
  return {
    __esModule: true,
    useAuth: () => ({ user: _user }),
    __setMockUser: (u: { uid?: string; email?: string } | null) => {
      _user = u;
    },
  };
});

/* Mock CartItem (relative import path from the component) */
vi.mock("@/routes/pages/CartItem", () => {
  return {
    __esModule: true,
    default: ({ product }: any) => (
      <div data-testid="cart-item">
        <span data-testid="cart-item-title">{product.title}</span>
      </div>
    ),
  };
});

/* Mock Button component used in CartPage */
vi.mock("@/components/ui/button", () => {
  return {
    __esModule: true,
    Button: ({ children, onClick, className }: any) => (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

/* Mock react-router Link (CartPage imports Link from "react-router") and useNavigate */
vi.mock("react-router", () => {
  const mockNavigate = vi.fn();
  return {
    __esModule: true,
    Link: ({ to, children }: any) => (
      <a data-testid="mock-link" href={to}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
  };
});

/**
 * Use spies for action creators so tests can assert they were called.
 * Define vi.fn mocks before calling vi.mock so the factory closes over them.
 */
const mockClearCart = vi.fn(() => ({ type: "cart/clear" }));
const mockClearCartInFirestore = vi.fn((uid: string) => ({
  type: "cart/clearInFirestore",
  payload: uid,
}));

/* Mock the cartSlice module: selectors + action creators. Hoist-safe. */
vi.mock("@/store/cart/cartSlice", () => {
  return {
    __esModule: true,
    selectCartLoading: (state: any) => state.cart.loading,
    selectCartError: (state: any) => state.cart.error,
    selectCartProducts: (state: any) => state.cart.cartProducts,
    selectCartTotal: (state: any) => ({
      totalAmount: state.cart.totalAmount ?? 0,
    }),
    clearCart: mockClearCart,
    clearCartInFirestore: mockClearCartInFirestore,
  };
});

/* Import the component under test AFTER mocks */
import CartPage from "@/routes/pages/CartPage";

/* Helper to create a test store containing cart slice */
function makeStore(cartState: any) {
  const cartReducer = (state = cartState) => state;
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: cartState },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  // reset mocked user between tests
  const authMock = await import("@/routes/auth/AuthContext");
  (authMock as any).__setMockUser(null);
});

describe("CartPage", () => {
  it("renders loading state when loading is true", () => {
    const store = makeStore({
      loading: true,
      error: null,
      cartProducts: [{ id: "x1", title: "Item X", price: 1 }],
      totalAmount: 1,
    });

    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    expect(screen.getByText(/Loading cart\.\.\./i)).toBeInTheDocument();
  });

  it("renders error message when error exists", () => {
    const store = makeStore({
      loading: false,
      error: "Network failed",
      cartProducts: [],
      totalAmount: 0,
    });

    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    expect(
      screen.getByText(/Error loading cart: Network failed/i)
    ).toBeInTheDocument();
  });

  it("shows empty cart message and link when cartProducts is empty", () => {
    const store = makeStore({
      loading: false,
      error: null,
      cartProducts: [],
      totalAmount: 0,
    });

    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    expect(screen.getByText(/Your cart is empty\./i)).toBeInTheDocument();
    const link = screen.getByTestId("mock-link");
    expect(link).toHaveAttribute("href", "/products");
    expect(screen.getByText(/Start shopping!/i)).toBeInTheDocument();
  });

  it("renders cart items and shows total, Clear Cart dispatches clearCart when no user", async () => {
    const cartProducts = [
      { id: "a1", title: "A", price: 10 },
      { id: "b2", title: "B", price: 20 },
    ];
    const store = makeStore({
      loading: false,
      error: null,
      cartProducts,
      totalAmount: 30,
    });

    // ensure mocked user is null BEFORE render
    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser(null);

    // spy on dispatch
    const dispatchSpy = vi.spyOn(store, "dispatch");

    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    const items = screen.getAllByTestId("cart-item");
    expect(items).toHaveLength(2);

    // Total displayed
    expect(screen.getByText(/Total: \$30\.00/)).toBeInTheDocument();

    // Click Clear Cart button (use accessible query by button name)
    const user = userEvent.setup();
    const clearBtn = screen.getByRole("button", { name: /clear cart/i });
    await user.click(clearBtn);

    // Expect the clearCart action creator to have been called (because user is null)
    expect(mockClearCart).toHaveBeenCalled();
    // And dispatch should have been called with its returned action
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "cart/clear" });
  });

  it("dispatches clearCartInFirestore when user is present (has uid)", async () => {
    const cartProducts = [{ id: "z9", title: "Z", price: 5 }];
    const store = makeStore({
      loading: false,
      error: null,
      cartProducts,
      totalAmount: 5,
    });

    // set mocked user BEFORE render
    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser({ uid: "user-42", email: "u@example.com" });

    const dispatchSpy = vi.spyOn(store, "dispatch");

    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    // Click Clear Cart once
    const user = userEvent.setup();
    const clearBtn = screen.getByRole("button", { name: /clear cart/i });
    await user.click(clearBtn);

    // wait for any async work and dispatches to finish
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    // Assert the action creator was called with uid
    expect(mockClearCartInFirestore).toHaveBeenCalledWith("user-42");

    // And dispatch should have been called with the action object returned by the action creator
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "cart/clearInFirestore",
      payload: "user-42",
    });
  });
});
