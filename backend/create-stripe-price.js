require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPrice() {
  const product = await stripe.products.create({
    name: 'SkillSwap Pro',
    description: 'Unlock AI Recommendations and premium features',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  console.log(price.id);
}

createPrice().catch(console.error);
