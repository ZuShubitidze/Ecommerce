import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductsResponse } from "@/store/products/interfaces/product.interface";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { handleToggleFavorite } from "@/store/favorites/hooks/handleToggleFavorite";
import { handleToggleCart } from "@/store/cart/hooks/handleToggleCart";

const ProductDetail = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return null;
  const id = useParams();
  const data: ProductsResponse = useSelector(
    (state: RootState) => state.products,
  );
  const favorites = useSelector(
    (state: RootState) => state.favorites.favorites,
  );
  const cart = useSelector((state: RootState) => state.cart.cartProducts);
  const isFavorite = favorites.some((fav) => fav.id === id.id);
  const isInCart = cart.some((car) => car.id === id.id);

  return (
    <div className="flex justify-center p-4">
      {data.products
        ?.filter((product) => product.id.toString() === id.id)
        .map(
          // Destructure product details
          ({
            category,
            description,
            id,
            images,
            price,
            title,
            reviews,
            rating,
          }) => (
            // Card for Product Details
            <Card
              className="p-4 w-250 h-full justify-center flex flex-col"
              key={id}
            >
              {/* Card Header */}
              <CardHeader className="flex items-center justify-between mb-4">
                <CardTitle>{title}</CardTitle>
                {user && (
                  <CardAction className="flex gap-4">
                    {/* Favorite Toggle Button */}
                    <Button
                      onClick={(event) =>
                        handleToggleFavorite(
                          event,
                          isFavorite,
                          user as any,
                          id,
                          dispatch,
                          { id, title, price, category, images },
                        )
                      }
                    >
                      {isFavorite
                        ? "❤️ Remove from Favorites"
                        : "🤍 Add to Favorites"}
                    </Button>
                    {/* Cart Toggle Button */}
                    <Button
                      onClick={(event) =>
                        handleToggleCart(
                          event,
                          isInCart,
                          user as any,
                          id,
                          dispatch,
                          {
                            id,
                            title,
                            price,
                            category,
                            images,
                          },
                        )
                      }
                    >
                      {isInCart ? "Remove from Cart" : "Add to Cart"}
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              {/* Card Content */}
              <CardContent className="flex flex-col gap-4 md:gap-8">
                <p>Price: ${price}</p>
                <p>Category: {category}</p>
                <p>Description: {description}</p>
                {images.length > 0 && (
                  <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-130 object-cover mt-2"
                  />
                )}
                {/* Rating */}
                <section>
                  <h3 className="text-lg font-semibold mb-2">Rating</h3>
                  <p>Rating: {rating} / 5</p>
                </section>
                {/* Reviews */}
                <section>
                  <h3 className="text-lg font-semibold mb-2">Reviews</h3>
                  <p>{reviews.length} reviews</p>
                  {reviews.map((review, index) => (
                    <div key={index} className="mb-4">
                      <p className="font-medium">{review.reviewerName}</p>
                      <p>Rating: {review.rating} / 5</p>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                </section>
              </CardContent>
              <CardFooter>Card Footer</CardFooter>
            </Card>
          ),
        )}
    </div>
  );
};

export default ProductDetail;
