import "./index.css";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import router from "./routes/routes.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import "./firebase.ts";
import { AuthProvider } from "./routes/auth/AuthContext.tsx";
import { initAuthListener } from "./app/authListener.ts";

initAuthListener();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </AuthProvider>
  </ThemeProvider>,
);
