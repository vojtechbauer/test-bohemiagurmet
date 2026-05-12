require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
  const { items, origin } = req.body;

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'czk',
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    quantity: 1,
  }));

  lineItems.push({
    price_data: {
      currency: 'czk',
      product_data: { name: 'Doprava Bohemia Gourmet' },
      unit_amount: 9900,
    },
    quantity: 1,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
