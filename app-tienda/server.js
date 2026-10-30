
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const databasePath = path.join(currentDir, "../datos/db.json");

function getProducts() {
  if (!fs.existsSync(databasePath)) {
    throw new Error("Catalog data not found. Generate db.json first.");
  }

  const database = JSON.parse(
    fs.readFileSync(databasePath, "utf8")
  );

  return database.products;
}

export function createServer() {
  return http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    // Health check
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200);
      return res.end(JSON.stringify({
        status: "ok",
        service: "qa-cloud-native-store"
      }));
    }

    // Product catalog
    if (req.method === "GET" && req.url === "/api/productos") {
      try {
        const products = getProducts();

        res.writeHead(200);
        return res.end(JSON.stringify({
          total: products.length,
          products
        }));
      } catch (error) {
        res.writeHead(500);
        return res.end(JSON.stringify({
          error: error.message
        }));
      }
    }

    // Create order
    if (req.method === "POST" && req.url === "/api/pedidos") {
      let body = "";

      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const order = JSON.parse(body);
          const products = getProducts();

          const product = products.find(
            item => item.id === Number(order.productId)
          );

          if (!product) {
            res.writeHead(404);
            return res.end(JSON.stringify({
              error: "Product not found"
            }));
          }

          if (
            !Number.isInteger(order.quantity) ||
            order.quantity <= 0 ||
            order.quantity > product.stock
          ) {
            res.writeHead(400);
            return res.end(JSON.stringify({
              error: "Invalid quantity or insufficient stock"
            }));
          }

          res.writeHead(201);
          return res.end(JSON.stringify({
            message: "Order created",
            productId: product.id,
            quantity: order.quantity,
            total: product.price * order.quantity
          }));
        } catch {
          res.writeHead(400);
          return res.end(JSON.stringify({
            error: "Invalid request body"
          }));
        }
      });

      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
      error: "Route not found"
    }));
  });
}

// Start the server when this file is executed directly
const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === currentFile;

if (isMainModule) {
  const PORT = process.env.PORT || 3000;

  createServer().listen(PORT, () => {
    console.log(`Store API running on port ${PORT}`);
  });
}
