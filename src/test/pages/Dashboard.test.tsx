import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";

/**
 * Declare a mutable variable that our module mock will read via a getter.
 * This lets each test set `mockCurrentUser` before rendering the component
 * without re-defining the module mock.
 */
let mockCurrentUser: { email?: string } | null = null;

/* Mock the firebase module BEFORE importing the component under test */
vi.mock("@/firebase", () => {
  return {
    __esModule: true,
    auth: {
      // return the current mockCurrentUser value when accessed
      get currentUser() {
        return mockCurrentUser;
      },
    },
  };
});

/* Import the component after the mock so the component uses the mocked auth */
import Dashboard from "@/routes/pages/Dashboard";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Dashboard page", () => {
  it("renders the user's email when auth.currentUser is present", () => {
    mockCurrentUser = { email: "alice@example.com" };

    render(<Dashboard />);

    // The component renders: <h1>Welcome, {user?.email}</h1>
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Welcome, alice@example.com");
  });

  it("renders without an email when there is no current user", () => {
    mockCurrentUser = null;

    render(<Dashboard />);

    const heading = screen.getByRole("heading", { level: 1 });
    // When user is null, user?.email is undefined — the heading will be "Welcome, " (possibly with trailing whitespace).
    expect(heading).toHaveTextContent(/^Welcome,\s*$/);
  });
});
