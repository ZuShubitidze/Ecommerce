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
import { handleToggleCart } from "@/store/cart/hooks/handleToggleCart";

// Props interface
interface FavoritesProductsProps {
  title: string;
  price: number;
  category?: string;
  images?: string[] | string | null;
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
  images,
  handleClick,
  user,
  isFavorite,
  id,
}: FavoritesProductsProps) => {
  // Determine image source with fallback
  const imgSrc =
    images?.[0] && images[0].startsWith("http") ? images[0] : substituteImage;

  const dispatch = useAppDispatch();
  const cart = useSelector((state: RootState) => state.cart.cartProducts);
  const favorites = useSelector((state: RootState) => state.favorites);
  const isInCart = cart.some((car) => car.id === id.toString());

  return (
    // Favorites Product Card
    <Card className="flex flex-col w-100" onClick={handleClick}>
      {/* Card Header */}
      <CardHeader className="flex flex-col md:flex-row items-center justify-between mb-4">
        <CardTitle>{title}</CardTitle>
        {user && (
          <CardAction className="flex flex-col gap-4 w-full md:items-end">
            {/* Remove from Favorites Button */}
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
            {/* Cart Toggle Button */}
            <Button
              onClick={(event) =>
                handleToggleCart(event, isInCart, user, id, dispatch, {
                  id,
                  title,
                  price,
                  category,
                  images: typeof images === "string" ? [images] : images,
                })
              }
            >
              {isInCart ? "Remove from Cart" : "Add to Cart"}
            </Button>
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
