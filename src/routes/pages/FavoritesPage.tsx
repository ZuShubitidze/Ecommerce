import FavoritesProducts from "@/components/FavoritesProducts";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

const FavoritesPage = () => {
  const favorites = useSelector((state: RootState) => state.favorites);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Navigate to product details on click
  const handleClick = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <div>
      <ul className="flex flex-wrap justify-center p-10 gap-10 md:py-15">
        {favorites.favorites.length === 0 && (
          <p className="text-2xl">
            You have no favorite products.
            <Link to="/products" className="text-blue-500 font-bold ml-2">
              Add some products!
            </Link>
          </p>
        )}
        {favorites.favorites.map((product) => (
          <FavoritesProducts
            key={product.id}
            id={product.id}
            category={product.category}
            images={product.images ? product.images : ""}
            price={product.price}
            title={product.title}
            isFavorite={favorites.favorites.some(
              (fav) => fav.id === product.id,
            )}
            handleClick={() => handleClick(product.id)}
            user={user}
          />
        ))}
      </ul>
    </div>
  );
};

export default FavoritesPage;
