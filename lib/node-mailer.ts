import nodemailer from "nodemailer";

// Create email transporter
export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVER_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});
