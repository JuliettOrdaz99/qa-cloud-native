
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../app-tienda/server.js";

let server;
let baseUrl;

before(async () => {
  server = createServer();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

// Smoke Test 1: Health check
test("GET /health should return HTTP 200", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
});

// Smoke Test 2: Product catalog
test("GET /api/productos should return 24 products", async () => {
  const response = await fetch(`${baseUrl}/api/productos`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.total, 24);
  assert.equal(body.products.length, 24);
});

// Smoke Test 3: Create a valid order
test("POST /api/pedidos should create a valid order", async () => {
  const response = await fetch(`${baseUrl}/api/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productId: 1,
      quantity: 2
    })
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.message, "Order created");
  assert.equal(body.quantity, 2);
  assert.ok(body.total > 0);
});

// Smoke Test 4: Reject an invalid order
test("POST /api/pedidos should reject invalid quantities", async () => {
  const response = await fetch(`${baseUrl}/api/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productId: 1,
      quantity: 0
    })
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Invalid quantity or insufficient stock");
});
