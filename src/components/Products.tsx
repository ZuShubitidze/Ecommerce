import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router";
import substituteImage from "../assets/download.png";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { handleToggleFavorite } from "@/store/favorites/hooks/handleToggleFavorite";
import { handleToggleCart } from "@/store/cart/hooks/handleToggleCart";

// Product Component Props
interface ProductsProps {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  user: any;
}

// Product Component
const Products = ({
  category,
  id,
  images,
  price,
  title,
  user,
}: ProductsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const favorites = useSelector(
    (state: RootState) => state.favorites.favorites
  );
  const cart = useSelector((state: RootState) => state.cart.cartProducts);
  const isFavorite = favorites.some((fav) => fav.id === id.toString());
  const isInCart = cart.some((car) => car.id === id.toString());

  // Navigate to product details on click
  const handleClick = () => {
    navigate(`/products/${id}`);
  };

  // Determine image source with fallback
  const imgSrc =
    images?.[0] && images[0].startsWith("http") ? images[0] : substituteImage;

  return (
    // Product Card
    <Card className="flex flex-col w-100" onClick={handleClick}>
      {/* Card Header */}
      <CardHeader className="flex flex-col md:flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {user && (
          // Card Actions
          <CardAction className="flex flex-col gap-4 w-full md:items-end">
            {/* Favorite Toggle Button */}
            <Button
              onClick={(event) =>
                handleToggleFavorite(event, isFavorite, user, id, dispatch, {
                  id,
                  title,
                  price,
                  category,
                  images,
                })
              }
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
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

export default Products;
