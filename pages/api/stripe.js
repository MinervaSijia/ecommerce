import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log(req.body)
    try {
        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            billing_address_collection: 'auto', 
            shipping_options: [
                {shipping_rate: 'shr_1Nz6S1LLxuKVUniW2ljZ0yJT'},
                {shipping_rate: 'shr_1Nz6SmLLxuKVUniW61C6V4Uh'},
            ],

            line_items: req.body.map(item => {
                const img = item.image[0].asset._ref; 
                const newImage = img.replace('img-', 'https://cdn.sanity.io/images/v4wmigv2/production/').replace('-webp', '.webp')
                
                return {
                    price_data: {
                        currency: 'AUD',
                        product_data: {
                            name: item.name,
                            images:[newImage],                         
                        },
                        unit_amount:item.price * 100,
                    },
                    adjustable_quantity: {
                        enabled: true,
                        minimum:1,
                    },
                    quantity: item.quantity
               }
            }),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      }
         
      const session = await stripe.checkout.sessions.create(params);
      
        res.status(200).json(session);
      res.redirect(303, session.url);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}