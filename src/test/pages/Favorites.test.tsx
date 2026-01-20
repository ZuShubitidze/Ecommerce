import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

/**
 * Mocks MUST be declared before importing the module under test so the module
 * picks up the mocked implementations.
 */

/* Mock react-router's useNavigate and Link (FavoritesPage imports both) */
const mockNavigate = vi.fn();
vi.mock("react-router", () => {
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

/* Mock the auth hook used by the component */
vi.mock("@/routes/auth/AuthContext", () => {
  return {
    __esModule: true,
    useAuth: () => ({ user: { id: "user-abc", name: "Tester" } }),
  };
});

/* Mock the FavoritesProducts component so tests focus on FavoritesPage behavior */
vi.mock("@/components/FavoritesProducts", () => {
  return {
    __esModule: true,
    default: ({ title, handleClick, user }: any) => (
      <li data-testid="fav-product">
        <span data-testid="fav-title">{title}</span>
        {" - "}
        <span data-testid="fav-user">{user?.id ?? "no-user"}</span>
        <button data-testid="fav-click" onClick={handleClick}>
          Open
        </button>
      </li>
    ),
  };
});

/* Import the component under test AFTER the mocks above */
import FavoritesPage from "@/routes/pages/FavoritesPage";

/* Helper to create a test store including the favorites slice */
function makeStore(preloadedFavoritesState: any) {
  const favoritesReducer = (state = preloadedFavoritesState) => state;

  return configureStore({
    reducer: {
      favorites: favoritesReducer,
    },
    preloadedState: {
      favorites: preloadedFavoritesState,
    },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FavoritesPage", () => {
  it("shows empty message and link when there are no favorites", () => {
    const store = makeStore({ favorites: [] });

    render(
      <Provider store={store}>
        <FavoritesPage />
      </Provider>
    );

    expect(
      screen.getByText(/You have no favorite products\./i)
    ).toBeInTheDocument();

    const link = screen.getByTestId("mock-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
    expect(screen.getByText(/Add some products!/i)).toBeInTheDocument();
  });

  it("renders a FavoritesProducts item for each favorite and navigates on click", async () => {
    const favorites = [
      { id: "a1", title: "Fav A", category: "c", images: [], price: 1 },
      { id: "b2", title: "Fav B", category: "c", images: [], price: 2 },
    ];
    const store = makeStore({ favorites });

    render(
      <Provider store={store}>
        <FavoritesPage />
      </Provider>
    );

    const items = screen.getAllByTestId("fav-product");
    expect(items).toHaveLength(2);

    // assert title and user id are rendered from the mocked FavoritesProducts
    expect(screen.getByText("Fav A")).toBeInTheDocument();
    expect(screen.getAllByTestId("fav-user")[0]).toHaveTextContent("user-abc");

    // clicking the first item's button should call the navigate mock with the product route
    const user = userEvent.setup();
    await user.click(screen.getAllByTestId("fav-click")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/products/a1");
  });
});
