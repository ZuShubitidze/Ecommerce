import type { User } from "firebase/auth";
import { removeFavoriteFromFirestore } from "../favoritesSlice";
import type { RootState } from "@/store/store";

export const removeFromFavorites = (
  event: React.MouseEvent,
  isFavorite: boolean,
  user: User | null,
  id: string,
  dispatch: any,
  favorites: RootState["favorites"]
) => {
  event.stopPropagation(); // Prevent card click event

  const favoriteProductData = favorites.favorites.find((fav) => fav.id === id);
  if (!user || !favoriteProductData) return;

  if (isFavorite) {
    dispatch(removeFavoriteFromFirestore(user.uid, id));
  } else {
    return;
  }
};
