import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { RootState } from "@/store/store";
import Products from "@/components/Products";
import { useSelector } from "react-redux";

const Home = () => {
  const { products } = useSelector((state: RootState) => state.products);
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return null;

  // Filter products for carousel
  const carouselProducts = products?.slice(0, 5) || [];
  return (
    // Carousel Section
    <Carousel
      opts={{
        align: "start",
      }}
      className="py-12 w-full mx-auto flex flex-col md:flex-row overflow-visible"
    >
      <CarouselPrevious className="mb-4 md:mb-0 p-2 bg-white rounded shadow-lg z-40 self-center" />

      {/* Carousel Content */}
      <CarouselContent className="">
        {carouselProducts.map((product, index) => (
          <CarouselItem
            key={index}
            className="basis-full md:basis-1/2 lg:basis-1/3 flex justify-center"
          >
            <Products
              id={product.id}
              category={product.category}
              description={product.description}
              images={product.images}
              price={product.price}
              title={product.title}
              user={user}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="mt-4 md:mt-0 p-2 bg-white rounded shadow-lg z-40 self-center" />
    </Carousel>
  );
};

export default Home;
