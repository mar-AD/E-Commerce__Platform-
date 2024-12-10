export function resetPassHtml(token: string): string {
  const resetLink = `https://your-domain.com/reset-password?token=${token}`;

  return `
    <html lang="">
      <body>
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The E-Commerce Platform Team</p>
      </body>
    </html>
  `;
}


