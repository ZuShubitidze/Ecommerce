import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Product } from "@/store/products/interfaces/product.interface";
import Products from "./Products";

export function CarouselComponent({
  products,
  carouselProducts,
  user,
}: {
  products: Product[];
  carouselProducts: Product[];
  user: any;
}) {
  return (
    // Carousel Section
    <Carousel
      opts={{
        align: "start",
      }}
      className="py-12 w-full mx-auto flex flex-col md:flex-row overflow-visible"
      key={products.length}
    >
      <CarouselPrevious className="mb-4 md:mb-0 p-2 bg-white rounded shadow-lg z-40 self-center" />

      {/* Carousel Content */}
      <CarouselContent className="gap-4">
        {carouselProducts.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-full lg:basis-1/3 flex justify-center"
          >
            <Products {...product} user={user} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="mt-4 md:mt-0 p-2 bg-white rounded shadow-lg z-40 self-center" />
    </Carousel>
  );
}
