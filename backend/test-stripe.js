const Stripe = require('stripe');
try {
  const stripe = new Stripe('sk_test_123', { apiVersion: '2025-01-27.acacia' });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
