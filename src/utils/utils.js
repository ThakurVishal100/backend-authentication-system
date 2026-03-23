export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPHtml(otp,userName) {
  return `
    <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 500px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
      }
      .logo {
        font-size: 22px;
        font-weight: bold;
        color: #4f46e5;
        margin-bottom: 20px;
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 6px;
        color: #111827;
        margin: 20px 0;
      }
      .message {
        font-size: 14px;
        color: #374151;
        margin-bottom: 20px;
      }
      .footer {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">Your Company</div>
      
      <p class="message">Hi ${userName},</p>
      
      <p class="message">
        Your One-Time Password (OTP) for verification is:
      </p>

      <div class="otp">${otp}</div>

      <p class="message">
        This OTP is valid for the next 5 minutes. Please do not share it with anyone.
      </p>

      <p class="message">
        If you did not request this, please ignore this email.
      </p>

      <div class="footer">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
    `;
}
