export function orderConfirmationEmail(
  orderId: string,
  customerName: string,
  orderDate: string,
  orderTotal: string,
  customerAddress: string,
  deliveryDate: string,
  items: { id: string; quantity: number }[]
): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      </tr>
    `
    )
    .join("");

  return `
    <html lang="en">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #4CAF50;">Order Confirmation - #${orderId}</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for shopping with us! Your order has been successfully placed. Below are the details:</p>

        <h3>Order Summary</h3>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Order Date:</strong> ${orderDate}</p>
        <p><strong>Total Amount:</strong> ${orderTotal}</p>

        <h3>Shipping Details</h3>
        <p><strong>Shipping Address:</strong> ${customerAddress}</p>
        <p><strong>Estimated Delivery Date:</strong> ${deliveryDate}</p>

        <h3>Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Quantity</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Thank you for choosing our store!</p>

        <p>Best regards,</p>
        <p><strong>The E-Commerce Platform Team</strong></p>
      </body>
    </html>
  `;
}
