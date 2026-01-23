const express = require("express");
const router = express.Router(); // ✅ Added this line to fix "router is not defined"
const axios = require("axios");
require("dotenv").config();

router.post("/initialize", async (req, res) => {
  try {
    const { amount, email, first_name, last_name, tx_ref, return_url } = req.body;

    const payload = {
      amount,
      currency: "ETB",
      email,
      first_name,
      last_name,
      tx_ref,
      payment_method: "telebirr",
      callback_url: `${process.env.YOUR_BACKEND_URL}/api/chapa/verify/${tx_ref}`,
      return_url,
    };

    const response = await axios.post(
      `${process.env.CHAPA_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: "Chapa initialization failed" });
  }
});

module.exports = router;
