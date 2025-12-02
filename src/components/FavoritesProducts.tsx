import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import substituteImage from "../assets/download.png";
import { removeFromFavorites } from "@/store/favorites/hooks/removeFromFavorites";
import { useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

// Props interface
interface FavoritesProductsProps {
  title: string;
  price: number;
  category: string;
  image: string;
  handleClick: () => void;
  isFavorite: boolean;
  user: any;
  id: string;
}

const FavoritesProducts = ({
  // Destructure props
  title,
  price,
  category,
  image,
  handleClick,
  user,
  isFavorite,
  id,
}: FavoritesProductsProps) => {
  // Determine image source with fallback
  const imgSrc = image && image.startsWith("http") ? image : substituteImage;
  const dispatch = useAppDispatch();
  const favorites = useSelector((state: RootState) => state.favorites);

  return (
    // Favorites Product Card
    <Card
      className="p-4 h-full w-100 md:w-120 flex flex-col"
      onClick={handleClick}
    >
      {/* Card Header */}
      <CardHeader className="flex items-center justify-between mb-4">
        <CardTitle>{title}</CardTitle>
        {user && (
          // Remove from Favorites Button
          <CardAction>
            <Button
              onClick={(event) =>
                removeFromFavorites(
                  event,
                  isFavorite,
                  user,
                  id,
                  dispatch,
                  favorites
                )
              }
            >
              ❤️ Remove from Favorites
            </Button>
            <Button>Add to Cart</Button>
          </CardAction>
        )}
      </CardHeader>
      {/* Card Content */}
      <CardContent className="flex flex-col items-center gap-4">
        <p>Price: ${price}</p>
        <p>Category: {category}</p>
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-50 object-cover mt-2"
          onError={(e) => (e.currentTarget.src = substituteImage)}
        />
      </CardContent>
      <CardFooter>Card Footer</CardFooter>
    </Card>
  );
};

export default FavoritesProducts;
