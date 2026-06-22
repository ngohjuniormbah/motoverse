export interface Product {
  id: number; name: string; brand: string; make: string; category: string;
  price: string; badge: string; stock: number; featured: boolean;
  description: string; image: string;
}
export const CATEGORIES = ["All", "Engine", "Brakes", "Suspension", "Electrical", "Interior", "Body", "Tools"];

export const CAR_MAKES = [
  { name: "Acura",     logo: "https://www.carlogos.org/car-logos/acura-logo.png" },
  { name: "Audi",      logo: "https://www.carlogos.org/car-logos/audi-logo.png" },
  { name: "BMW",       logo: "https://www.carlogos.org/car-logos/bmw-logo.png" },
  { name: "Buick",     logo: "https://www.carlogos.org/car-logos/buick-logo.png" },
  { name: "Cadillac",  logo: "https://www.carlogos.org/car-logos/cadillac-logo.png" },
  { name: "Chevrolet", logo: "https://www.carlogos.org/car-logos/chevrolet-logo.png" },
  { name: "Dodge",     logo: "https://www.carlogos.org/car-logos/dodge-logo.png" },
  { name: "Fiat",      logo: "https://www.carlogos.org/car-logos/fiat-logo.png" },
  { name: "Ford",      logo: "https://www.carlogos.org/car-logos/ford-logo.png" },
  { name: "GMC",       logo: "https://www.carlogos.org/car-logos/gmc-logo.png" },
  { name: "Honda",     logo: "https://www.carlogos.org/car-logos/honda-logo.png" },
  { name: "Hyundai",   logo: "https://www.carlogos.org/car-logos/hyundai-logo.png" },
  { name: "Infiniti",  logo: "https://www.carlogos.org/car-logos/infiniti-logo.png" },
  { name: "Jeep",      logo: "https://www.carlogos.org/car-logos/jeep-logo.png" },
  { name: "Kia",       logo: "https://www.carlogos.org/car-logos/kia-logo.png" },
  { name: "Land Rover",logo: "https://www.carlogos.org/car-logos/land-rover-logo.png" },
  { name: "Lexus",     logo: "https://www.carlogos.org/car-logos/lexus-logo.png" },
  { name: "Mazda",     logo: "https://www.carlogos.org/car-logos/mazda-logo.png" },
  { name: "Mercedes",  logo: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png" },
  { name: "Nissan",    logo: "https://www.carlogos.org/car-logos/nissan-logo.png" },
  { name: "Subaru",    logo: "https://www.carlogos.org/car-logos/subaru-logo.png" },
  { name: "Toyota",    logo: "https://www.carlogos.org/car-logos/toyota-logo.png" },
  { name: "Volkswagen",logo: "https://www.carlogos.org/car-logos/volkswagen-logo.png" },
];
