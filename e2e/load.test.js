
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TOTAL_REQUESTS = 100;
const SLA_P95_MS = 800;
const SLA_ERROR_RATE = 1;

const responseTimes = [];
let errors = 0;

console.log(`Load test target: ${BASE_URL}`);
console.log(`Total requests: ${TOTAL_REQUESTS}`);

for (let i = 0; i < TOTAL_REQUESTS; i++) {
  const start = performance.now();

  try {
    const response = await fetch(`${BASE_URL}/api/productos`);
    const duration = performance.now() - start;

    responseTimes.push(duration);

    if (!response.ok) {
      errors++;
      continue;
    }

    const body = await response.json();

    if (!Array.isArray(body.products) || body.products.length !== 24) {
      errors++;
    }
  } catch (error) {
    errors++;
    console.error(`Request ${i + 1} failed: ${error.message}`);
  }
}

responseTimes.sort((a, b) => a - b);

const p95Index = Math.ceil(responseTimes.length * 0.95) - 1;
const p95 = responseTimes.length > 0 ? responseTimes[p95Index] : Infinity;

const errorRate = (errors / TOTAL_REQUESTS) * 100;

console.log("\n===== LOAD TEST RESULTS =====");
console.log(`Requests: ${TOTAL_REQUESTS}`);
console.log(`Errors: ${errors}`);
console.log(`Error rate: ${errorRate.toFixed(2)}%`);
console.log(`p95 response time: ${p95.toFixed(2)} ms`);
console.log(`SLA p95: < ${SLA_P95_MS} ms`);
console.log(`SLA error rate: < ${SLA_ERROR_RATE}%`);

const p95Passed = p95 < SLA_P95_MS;
const errorRatePassed = errorRate < SLA_ERROR_RATE;

if (!p95Passed || !errorRatePassed) {
  console.error("\nLOAD TEST FAILED: SLA threshold exceeded.");
  process.exit(1);
}

console.log("\nLOAD TEST PASSED: All SLA thresholds met.");
