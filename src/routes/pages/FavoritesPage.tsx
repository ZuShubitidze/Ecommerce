import FavoritesProducts from "@/components/FavoritesProducts";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

const FavoritesPage = () => {
  const favorites = useSelector((state: RootState) => state.favorites);
  const navigate = useNavigate();
  const user = useAuth().user;

  // Navigate to product details on click
  const handleClick = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <div>
      <ul className="flex flex-wrap justify-center p-10 gap-10 md:py-15">
        {favorites.favorites.map((product) => (
          <FavoritesProducts
            key={product.id}
            id={product.id}
            category={product.category}
            images={product.images ? product.images : ""}
            price={product.price}
            title={product.title}
            isFavorite={favorites.favorites.some(
              (fav) => fav.id === product.id
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
