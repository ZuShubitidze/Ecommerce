import { onAuthStateChanged } from "firebase/auth";
import { setUser } from "@/features/auth/authSlice";
import { mapFirebaseUser } from "@/features/auth/authUtils";
import { auth } from "@/firebase";
import { store } from "@/store/store";

export const initAuthListener = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      store.dispatch(setUser(mapFirebaseUser(user)));
    } else {
      store.dispatch(setUser(null));
    }
  });
};
