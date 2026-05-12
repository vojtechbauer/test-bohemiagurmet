import Stripe from 'stripe';

export const handler = async (event, context) => {
  // Povolení pouze POST požadavků
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { items, origin } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Kosik je prazdny' })
      };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY chybi v nastaveni Netlify!');
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

    // Doprava
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

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (error) {
    console.error('STRIPE ERROR:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
