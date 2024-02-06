require("dotenv").config();
const functions = require('@google-cloud/functions-framework');
const Stripe = require("stripe");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const { db } = require("./firebaseConfig.js");

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
app.use(
  session({
    secret: 'b+opKFTPztZ2f6pmLe/hiIXpeLbgqa8qecLI0x58d48=',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cors());
app.use(express.json());

app.get('/login', (req, res) => {
  if (req.body.user_email) {
    return res.redirect("index.html");
  }
  return res.redirect("login.html");
});

app.post("/saveUserData", (req, res) => {
  user_email = req.body.email;
  req.body.user_email = req.body.email;
  console.log(req.body);
  res.send({
    login: "successfull",
  });
});

app.get("/signup", (req, res) => {
  if (req.body.user_email) {
    return res.redirect("/index.html");
  }
  res.sendFile(path.join(__dirname, "public/register.html"));
});

app.get("/logout", (req, res) => {
  req.body.destroy((err) => {
    if (err) {
      console.error("Error destroying session: ", err);
      return res.status(500).send("Could not log out, server error");
    }
    res.redirect("/");
  });
});

app.get("/check-login", (req, res) => {
  console.log(req.body);
  if (req.body.user_email) {
    res.json({ isLoggedIn: true, userEmail: req.body.user_email });
  } else {
    res.json({ isLoggedIn: false });
  }
});

app.post("/manage-subscription", async (req, res) => {
  if (req.body.user_email) {
    const email = req.body.user_email;
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();
    const stripeCustomerId = userDoc.data().stripeCustomerId;
    if (stripeCustomerId) {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: "http://datafromfile.com/",
        // return_url: "http://localhost:3000/",
        // return_url: `${req.protocol}://${req.headers.host}`,
      });
      // res.status(302).set('Location', session.url).end();
      res.send({
        redirectUrl: session.url
      })
    } else {
      res
        .status(404)
        .send(
          "No Subscription found, Please by a Plan to access Manage Subscription"
        );
    }
  } else {
    // res.status(302).set('Location', "login.html").end();
    res.send({
      redirectUrl: 'login.html'
    })
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const { planId } = req.body;

  if (!req.body.user_email) {
    return res.status(401).send("User not authenticated");
  }

  const userEmail = req.body.user_email;

  try {
    const userRef = db.collection("users").doc(userEmail);
    const userDoc = await userRef.get();
    let stripeCustomerId = userDoc.exists
      ? userDoc.data().stripeCustomerId
      : null;

    if (!stripeCustomerId) {
      // Create a new Stripe customer for new users
      const newCustomer = await stripe.customers.create({ email: userEmail });
      stripeCustomerId = newCustomer.id;
      // Save the new Stripe customer ID in Firebase
      await userRef.set({ stripeCustomerId }, { merge: true });
    }

    // Check if the user already has an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
    });

    if (subscriptions.data.length > 0) {
      // The customer already has an active subscription
      // Instead of creating a new session, return a message to alert the user
      return res.status(409).json({
        error:
          "You already have an active subscription. Please manage your subscription from the account settings.",
      });
    } else {
      // No active subscriptions, so create a new checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [{ price: planId, quantity: 1 }],
        mode: "subscription",
        success_url: `http://datafromfile.com/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://datafromfile.com/cancel`,
        // success_url: `${req.protocol}://${req.headers.host}/success?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${req.protocol}://${req.headers.host}/cancel`,
      });
      res.json({ sessionId: session.id });
    }
  } catch (error) {
    console.error(`Error in subscription process: ${error.message}`);
    res.status(500).send(error.message);
  }
});

functions.http('run', app);
