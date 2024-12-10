export function emailUpdateRequestHtml(verificationCode: string): string {
  return `
    <html lang="">
      <body>
        <h1>Email Update Request</h1>
        <p>Hello,</p>
        <p>We received a request to update your email address. To confirm your request, please enter the following verification code:</p>
        <h2 style="color: #4CAF50;">${verificationCode}</h2>
        <p>If you did not request an email update, please ignore this email. If you need further assistance, feel free to reach out to our support team.</p>
        <p>Best regards,</p>
        <p>The E-Commerce Platform Team</p>
      </body>
    </html>
  `;
}
