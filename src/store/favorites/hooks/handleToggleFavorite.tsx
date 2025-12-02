import type { FavoriteProductData } from "@/store/favorites/interfaces/favorites.interface";
import {
  addFavoriteToFirestore,
  removeFavoriteFromFirestore,
} from "@/store/favorites/favoritesSlice";
import type { User } from "firebase/auth";

// Handle toggling favorite status
export const handleToggleFavorite = (
  event: React.MouseEvent,
  isFavorite: boolean,
  user: User | null,
  id: string,
  dispatch: any,
  favoriteProductData: FavoriteProductData
) => {
  event.stopPropagation(); // Prevent card click event

  // Ensure user is logged in
  if (!user) {
    alert("Please log in to manage favorites!");
    // Or redirect to login page
    return;
  }

  // Dispatch appropriate action
  if (isFavorite) {
    dispatch(removeFavoriteFromFirestore(user.uid, id));
  } else {
    dispatch(addFavoriteToFirestore(user.uid, favoriteProductData));
  }
};
