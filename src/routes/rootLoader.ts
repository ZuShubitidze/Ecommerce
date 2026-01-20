import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const rootLoader = async () => {
  // Simulate fetching some global data needed for the root route
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolve({ user });
      unsubscribe();
    });
  });
};
