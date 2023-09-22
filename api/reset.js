const UserModel = require("../models/UserModel");
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { default: isEmail } = require("validator/lib/isEmail");
const baseUrl = require("../utils/baseUrl");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "prathameshghorpade933@gmail.com",
    pass: "tzyqzqhbyzukodoi",
  },
});

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!isEmail(email)) {
    return res.status(401).send("Invalied Email!");
  }

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.status(404).send("user not found!");
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.expireToken = Date.now() + 3600000;

  await user.save();

  const href = `${baseUrl}/reset/${token}`;
  console.log("**************", href);
  const mailOptions = {
    from: "admin@socialMedia.com",
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>Hey ${user.name
      .split(" ")[0]
      .toString()},There was request for password reset. <a href=${href}>Click here to reset password</a></p>
    <p>This token is valid for only 1 hour.</p>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send the password reset email");
    } else {
      console.log("Password reset email sent:", info.response);
      res.status(200).send("Password reset email sent successfully");
    }
  });
});

// Define a route to verify the token and reset the password
router.post("/token", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || newPassword.length < 6) {
      return res.status(401).send("Unauthorized!");
    }
    const user = await UserModel.findOne({ resetToken: token });

    if (!user) {
      return res.status(404).send("user not found!");
    }

    if (Date.now() > user.expireToken) {
      return res.status(401).send("Invalid or expired token");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetToken = "";
    user.expireToken = undefined;

    await user.save();

    res.status(200).send("Password reset successful");
  } catch (err) {
    console.error("Password reset failed", err);
    res.status(500).send("Password reset failed");
  }
});

module.exports = router;
