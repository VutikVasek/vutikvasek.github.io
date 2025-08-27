import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({
  refresh_token: process.env.EMAIL_REFRESH_TOKEN,
});

export function getVerificationEmail(link) {
  return `
  <div style="text-align:center; font-family: Arial">
  <h1 style="background: rgb(2, 7, 23); color: white; display: flex; width: fit-content; align-items: center; padding: 1rem; border-radius: 1rem; margin: 1rem auto;">
    <img src="http://localhost:5173/assets/Logo.svg" style="height: 3rem; margin-right: 1rem">VUTINK
  </h1>
  <h1>Welcome to Vutink!</h1>
  <h3 style="font-weight: 500">We are exicited that you are joining us, but before you start posting, you need to verify your email.</h3>
  <h2><a href="${link}" style="font-weight: 600; margin: 2rem 0; text-decoration: none; color: white; background: rgb(10, 35, 115); padding: 1rem 2rem; display: inline-block; border-radius: 999999px; border: 4px solid rgb(10, 35, 115);">VERIFY EMAIL ADDRESS</a></h2>
  <div style="color: #666">
    <p>If you didn't try to create an account, ignore this email.</p>
    <p>This is an automated email, please do not respond to it.</p>
    <p>vutik.shop</p>
    <p>Vutink 2025</p>
  </div>
</div>
  `
}

export async function sendEmail(to, subject, html) {
  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  await transporter.sendMail({
    from: `Vutink <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}