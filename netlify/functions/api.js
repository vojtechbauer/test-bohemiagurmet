const express = require('express');
const serverless = require('serverless-http');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const router = express.Router();

router.use(cors());
router.use(express.json());

router.get('/health', (req, res) => res.send('API is live on Netlify'));

router.post('/create-checkout-session', async (req, res) => {
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

    res.json({ url: session.url });
  } catch (error) {
    console.error('STRIPE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
