require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Robust CORS configuration
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.send('Backend is running'));

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, origin } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Kosik je prazdny' });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'czk',
        product_data: {
          name: item.name,
          description: `Vyrobce: ${item.producer}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    // Add shipping (99 CZK)
    lineItems.push({
      price_data: {
        currency: 'czk',
        product_data: { name: 'Doprava (Kurýr Bohemia)' },
        unit_amount: 9900,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    console.log(`Session created: ${session.id}`);
    res.json({ url: session.url });

  } catch (error) {
    console.error('CRITICAL STRIPE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log('-----------------------------------------');
  console.log(`  STRIPE BACKEND RUNNING ON PORT ${PORT}`);
  console.log('-----------------------------------------');
});
