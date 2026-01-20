import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

/**
 * Updated test file notes:
 * - Mock react-router so useNavigate() doesn't require a Router in tests.
 * - Use dynamic `await import(...)` to access mock helpers exported from vi.mock
 *   (avoids CommonJS `require` in ESM environment).
 * - Cast imported mock modules to `any` when calling the test-only helpers so
 *   TypeScript accepts `null` as a possible value.
 */

/* Mock react-router so useNavigate works without a Router and Link renders as <a> */
vi.mock("react-router", () => {
  const mockNavigate = vi.fn();
  return {
    __esModule: true,
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: any) => (
      <a data-testid="mock-link" href={to}>
        {children}
      </a>
    ),
  };
});

/* Mock stripe loader and Elements synchronously */
vi.mock("@stripe/stripe-js", () => {
  return {
    __esModule: true,
    loadStripe: () => ({ mockStripe: true }),
  };
});
vi.mock("@stripe/react-stripe-js", () => {
  return {
    __esModule: true,
    Elements: ({ children }: any) => (
      <div data-testid="elements">{children}</div>
    ),
  };
});

/* Mock CheckoutForm so tests can inspect props and trigger callbacks */
vi.mock("@/components/stripe/CheckoutForm", () => {
  return {
    __esModule: true,
    default: ({
      amount,
      currency,
      onPaymentSuccess,
      onPaymentError,
      cartProducts,
    }: any) => {
      return (
        <div
          data-testid="checkout-form"
          data-amount={amount}
          data-currency={currency}
        >
          <span data-testid="cf-count">{(cartProducts || []).length}</span>
          <button data-testid="cf-success" onClick={() => onPaymentSuccess?.()}>
            success
          </button>
          <button
            data-testid="cf-error"
            onClick={() => onPaymentError?.("err")}
          >
            error
          </button>
        </div>
      );
    },
  };
});

/* Mock the auth module (use the same specifier the app uses) and expose a setter helper.
   The factory must be hoist-safe (no external test-scoped closures). */
vi.mock("@/routes/auth/AuthContext", () => {
  let _user: { uid?: string; email?: string } | null = null;
  return {
    __esModule: true,
    useAuth: () => ({ user: _user }),
    __setMockUser: (u: { uid?: string; email?: string } | null) => {
      _user = u;
    },
  };
});

/* Mock cartSlice: selectors + subscribeToCart. Expose mocks for assertions. */
vi.mock("@/store/cart/cartSlice", () => {
  const unsubscribeMock = vi.fn();
  const subscribeToCart = vi.fn(() => {
    return unsubscribeMock;
  });

  return {
    __esModule: true,
    selectCartTotal: (state: any) => ({
      totalAmount: state.cart.totalAmount ?? 0,
      currency: state.cart.currency ?? "usd",
    }),
    selectCartLoading: (state: any) => state.cart.loading,
    selectCartError: (state: any) => state.cart.error,
    selectCartProducts: (state: any) => state.cart.cartProducts,
    subscribeToCart,
    __unsubscribeMock: unsubscribeMock,
    __subscribeToCartMock: subscribeToCart,
  };
});

/* Import the component after mocks */
import PaymentPage from "@/routes/pages/PaymentPage";

/* Helper to create a store containing cart slice only */
function makeStore(cartState: any) {
  const cartReducer = (state = cartState) => state;
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: cartState },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PaymentPage", () => {
  it("renders CheckoutForm when user is logged in and cart has products; subscribeToCart is called", async () => {
    const cartProducts = [{ id: "p1" }, { id: "p2" }];
    const store = makeStore({
      loading: false,
      error: null,
      cartProducts,
      totalAmount: 12.34,
      currency: "usd",
    });

    // Set the mocked user via the helper exported from the auth mock (dynamic import)
    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser({ uid: "u-1", email: "a@b.com" });

    // ensure dispatch returns the value passed (the subscribeToCart mock returns unsubscribeMock)
    const dispatchSpy = vi
      .spyOn(store, "dispatch")
      .mockImplementation((action: any) => action);

    render(
      <Provider store={store}>
        <PaymentPage />
      </Provider>
    );

    // Elements wrapper present
    expect(screen.getByTestId("elements")).toBeInTheDocument();

    // CheckoutForm rendered and receives amount in smallest unit
    const cf = screen.getByTestId("checkout-form");
    // totalAmount 12.34 -> amountInSmallestUnit = Math.round(12.34 * 100) = 1234
    expect(cf).toHaveAttribute("data-amount", "1234");
    expect(cf).toHaveAttribute("data-currency", "usd");

    // cartProducts count passed
    expect(screen.getByTestId("cf-count")).toHaveTextContent("2");

    // Assert subscribeToCart mock was called with the uid
    const cartModule = await import("@/store/cart/cartSlice");
    expect((cartModule as any).__subscribeToCartMock).toHaveBeenCalledWith(
      "u-1"
    );

    // dispatch should have been called with the unsubscribe function returned by the mock
    expect(dispatchSpy).toHaveBeenCalledWith(
      (cartModule as any).__unsubscribeMock
    );
  });

  it("prompts login when user is not present", async () => {
    const store = makeStore({
      loading: false,
      error: null,
      cartProducts: [{ id: "p1" }],
      totalAmount: 10,
      currency: "usd",
    });

    // Clear the mocked user
    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser(null);

    render(
      <Provider store={store}>
        <PaymentPage />
      </Provider>
    );

    // should show login link text
    expect(
      screen.getByText(/Please log in to proceed with payment/i)
    ).toBeInTheDocument();
  });

  it("shows empty cart message when cartProducts is empty or totalAmount is 0", async () => {
    const storeEmpty = makeStore({
      loading: false,
      error: null,
      cartProducts: [],
      totalAmount: 0,
      currency: "usd",
    });

    // Set user so we reach the empty-cart branch
    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser({ uid: "u-1" });

    render(
      <Provider store={storeEmpty}>
        <PaymentPage />
      </Provider>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it("shows loading and error states from selectors", async () => {
    const storeLoading = makeStore({
      loading: true,
      error: null,
      cartProducts: [{ id: "p1" }],
      totalAmount: 5,
      currency: "usd",
    });

    const authMock = await import("@/routes/auth/AuthContext");
    (authMock as any).__setMockUser({ uid: "u-1" });

    const { rerender } = render(
      <Provider store={storeLoading}>
        <PaymentPage />
      </Provider>
    );

    expect(screen.getByText(/Loading your cart details/i)).toBeInTheDocument();

    // now render error state
    const storeError = makeStore({
      loading: false,
      error: "boom",
      cartProducts: [{ id: "p1" }],
      totalAmount: 5,
      currency: "usd",
    });

    rerender(
      <Provider store={storeError}>
        <PaymentPage />
      </Provider>
    );

    expect(screen.getByText(/Error loading cart: boom/i)).toBeInTheDocument();
  });
});
