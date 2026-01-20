import type { User } from "firebase/auth";
import type { AuthUser } from "./types";

export const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  providerId: user.providerId,
});
