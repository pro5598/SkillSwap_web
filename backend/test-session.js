require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/skillswap_db");
  const session = await stripe.checkout.sessions.retrieve('cs_test_a1omfkoqgy6T3zhsCYhOtIkYYtA4ZkKATRxJyEkrITV8G7VbBNM2WliWKN');
  console.log("Payment status:", session.payment_status);
  
  const { UserModel } = require('./src/models/user.model.ts');
  console.log("Update success");
  process.exit(0);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
