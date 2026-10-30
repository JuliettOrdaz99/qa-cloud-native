
import { faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";

// 1. Configuracion de datos reproducibles
const SEED = 20261030;

faker.seed(SEED);

// 2. Categorias de nuestra tienda
const categories = [
  "Electronica",
  "Ropa",
  "Hogar",
  "Deportes"
];

// 3. Generacion de 24 productos
const products = Array.from({ length: 24 }, (_, index) => {

  const category = categories[index % categories.length];

  return {
    id: index + 1,
    sku: `SKU-${String(index + 1).padStart(4, "0")}`,
    name: faker.commerce.productName(),

    price: faker.number.int({
      min: 100,
      max: 25000
    }),

    stock: faker.number.int({
      min: 0,
      max: 100
    }),

    category
  };
});

// 4. Construccion del catalogo
const catalog = {
  seed: SEED,
  totalProducts: products.length,
  categories,
  products
};

// 5. Guardar catalogo en db.json
const outputPath = path.join(
  import.meta.dirname,
  "db.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(catalog, null, 2),
  "utf8"
);

// 6. Mensaje de confirmacion
console.log("Catalogo generado correctamente.");
console.log(`Total de productos: ${products.length}`);
console.log(`Total de categorias: ${categories.length}`);
console.log(`Archivo generado: ${outputPath}`);
