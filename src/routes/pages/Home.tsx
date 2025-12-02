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
  const { data } = useSelector((state: RootState) => state.products);

  // Filter products for carousel
  const carouselProducts = data?.products.slice(0, 5) || [];

  return (
    // Carousel Section
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-100 m-auto md:w-full h-auto md:px-4 lg:px-6"
    >
      {/* Carousel Content */}
      <CarouselContent className="flex">
        {carouselProducts.map((product, index) => (
          <CarouselItem
            key={index}
            className="basis-full md:basis-1/2 lg:basis-1/3"
          >
            <Products
              id={product.id}
              category={product.category}
              description={product.description}
              images={product.images}
              price={product.price}
              title={product.title}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default Home;
