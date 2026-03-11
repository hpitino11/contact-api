const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.get("/", (req, res) => {
  res.send("Contact API is running.");
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, company } = req.body;

    if (company) {
      return res.status(400).json({ message: "Invalid submission." });
    }

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL,
      subject: `New message from ${name}`,
      reply_to: email,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
      `
    });

    res.json({ message: "Message sent successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});