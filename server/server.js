require("dotenv").config();

const express = require("express");
const app = express();
const cors = require('cors')
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5500',
}))

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { price: 1000, name: "white t-shirt" }],
  [2, { price: 1500, name: "blue t-shirt" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.price,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
