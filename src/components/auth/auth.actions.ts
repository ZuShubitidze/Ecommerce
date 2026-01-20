import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { redirect } from "react-router";

export async function loginAction({ request }: { request: Request }) {
  const auth = getAuth();
  const formData = await request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const providerType = formData.get("provider");

  try {
    if (providerType === "google") {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }

    return redirect("/");
  } catch (error: any) {
    return {
      error: error.code || "auth/unknown-error",
      message: error.message,
    };
  }
}
