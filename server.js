const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
require("dotenv").config();
const Recharging = require("./models/Recharging");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
const db = process.env.DB_DEV;
const app = express();
const port = process.env.PORT || 5001;
mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected: ", app.settings.env))
  .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(express.static(path.join(__dirname, "build")));

app.post("/recharge", async (req, res) => {
  if (req.body.money === "" || req.body.email === "") {
    return res.status(400).json({ error: "Please input correct money" });
  }
  const comp = {};
  comp.user = req.body.name;
  comp.money = req.body.money;
  comp.email = req.body.email;
  comp.recharge = req.body.address;
  comp.status = req.body.status;
  var options = {
    amount: comp.money * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_" + comp.recharge,
  };
  var instance = new Razorpay({
    key_id: process.env.RAZ_KEY,
    key_secret: process.env.RAZ_SECRET,
  });
  instance.orders.create(options, async function (err, order) {
    console.log(order);
    comp.order = order.id;
    await new Recharging(comp).save();
    if (!err) {
      return res.status(200).json({
        order,
        key: process.env.RAZ_KEY,
        email: req.body.email,
        url: process.env.APP_URL + "/response",
      });
    } else {
      return res.status(400).json({ message: "error" });
    }
  });
});

app.post("/response/0", async function (req, res) {
  // console.log(req.params.whereTo);

  const recharging = await Recharging.findOne({
    order: req.body.razorpay_order_id,
  }).catch((err) => {
    console.log("recharging failed");
    return res.redirect("/failed");
  });
  const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var expectedSignature;
  expectedSignature = crypto
    .createHmac("sha256", process.env.RAZ_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log(expectedSignature + " " + req.body.razorpay_signature);

  if (expectedSignature == req.body.razorpay_signature) {
    // console.log('verified');
    console.log(recharging.status);
    if (recharging.status == 1) {
      const token = jwt.sign(
        {
          user: recharging.user,
          recharge: recharging.recharge,
          money: recharging.money,
          order: recharging.order,
        },
        process.env.AUTH_SECRET,
        {
          expiresIn: "1h",
        }
      );
      // console.log('redirecting');
      return res.redirect(
        process.env.LOTTERY_0 + "/api/response-recharge/" + token
      );
    }
    return res.redirect("/success");
  } else {
    console.log("not verified");
    return res.redirect("/failed");
  }
});

app.post("/response/1", async function (req, res) {
  console.log("respond");

  const recharging = await Recharging.findOne({
    order: req.body.razorpay_order_id,
  }).catch((err) => {
    console.log("recharging failed");
    return res.redirect("/failed");
  });
  const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var expectedSignature;
  expectedSignature = crypto
    .createHmac("sha256", process.env.RAZ_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log(expectedSignature + " " + req.body.razorpay_signature);

  if (expectedSignature == req.body.razorpay_signature) {
    // console.log('verified');
    console.log(recharging.status);
    if (recharging.status == 1) {
      const token = jwt.sign(
        {
          user: recharging.user,
          recharge: recharging.recharge,
          money: recharging.money,
          order: recharging.order,
        },
        process.env.AUTH_SECRET,
        {
          expiresIn: "1h",
        }
      );
      // console.log('redirecting');
      return res.redirect(
        process.env.LOTTERY_1 + "/api/response-recharge/" + token
      );
    }
    return res.redirect("/success");
  } else {
    console.log("not verified");
    return res.redirect("/failed");
  }
});

app.post("/response/2", async function (req, res) {
  console.log("respond");

  const recharging = await Recharging.findOne({
    order: req.body.razorpay_order_id,
  }).catch((err) => {
    console.log("recharging failed");
    return res.redirect("/failed");
  });
  const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var expectedSignature;
  expectedSignature = crypto
    .createHmac("sha256", process.env.RAZ_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log(expectedSignature + " " + req.body.razorpay_signature);

  if (expectedSignature == req.body.razorpay_signature) {
    // console.log('verified');
    console.log(recharging.status);
    if (recharging.status == 1) {
      const token = jwt.sign(
        {
          user: recharging.user,
          recharge: recharging.recharge,
          money: recharging.money,
          order: recharging.order,
        },
        process.env.AUTH_SECRET,
        {
          expiresIn: "1h",
        }
      );
      // console.log('redirecting');
      return res.redirect(
        process.env.LOTTERY_2 + "/api/response-recharge/" + token
      );
    }
    return res.redirect("/success");
  } else {
    console.log("not verified");
    return res.redirect("/failed");
  }
});
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(port, (error) => {
  if (error) throw error;
  console.log("Server running on port" + port);
});
