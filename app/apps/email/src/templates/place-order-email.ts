// export function orderConfirmationEmail(
//   orderId: string,
//   customerName: string,
//   orderDate: string,
//   orderTotal: string,
//   customerAddress: string,
//   deliveryDate: string,
//   items: { id: string; quantity: number }[]
// ): string {
//   const itemsHtml = items
//     .map(
//       (item) => `
//       <tr>
//         <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.id}</td>
//         <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
//       </tr>
//     `
//     )
//     .join("");
//
//   return `
//     <html lang="en">
//       <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h1 style="color: #4CAF50;">Order Confirmation - #${orderId}</h1>
//         <p>Dear ${customerName},</p>
//         <p>Thank you for shopping with us! Your order has been successfully placed. Below are the details:</p>
//
//         <h3>Order Summary</h3>
//         <p><strong>Order ID:</strong> #${orderId}</p>
//         <p><strong>Order Date:</strong> ${orderDate}</p>
//         <p><strong>Total Amount:</strong> ${orderTotal}</p>
//
//         <h3>Shipping Details</h3>
//         <p><strong>Shipping Address:</strong> ${customerAddress}</p>
//         <p><strong>Estimated Delivery Date:</strong> ${deliveryDate}</p>
//
//         <h3>Items Ordered</h3>
//         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//           <thead>
//             <tr style="background-color: #f2f2f2;">
//               <th style="padding: 8px; text-align: left;">Item</th>
//               <th style="padding: 8px; text-align: center;">Quantity</th>
//               <th style="padding: 8px; text-align: right;">Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsHtml}
//           </tbody>
//         </table>
//
//         <p>If you have any questions, feel free to contact our support team.</p>
//         <p>Thank you for choosing our store!</p>
//
//         <p>Best regards,</p>
//         <p><strong>The E-Commerce Platform Team</strong></p>
//       </body>
//     </html>
//   `;
// }


export function orderConfirmationEmail(
  orderId: string,
  customerName: string,
  orderDate: string,
  orderTotal: string,
  customerAddress: string,
  deliveryDate: string,
  items: { name: string; image: string; design: string; color: string; size: string; quantity: number; totalPrice: string }[]
): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left;">${item.design}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.color}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${item.totalPrice}</td>
      </tr>
    `
    )
    .join("");

  return `
    <html lang="en">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; padding: 20px;">
        <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin: auto;">
          <h1 style="color: #4CAF50; text-align: center;">Order Confirmation - #${orderId}</h1>
          <p style="text-align: center;">Dear <strong>${customerName}</strong>,</p>
          <p style="text-align: center;">Thank you for shopping with us! Your order has been successfully placed.</p>

          <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Order Summary</h3>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Total Amount:</strong> ${orderTotal}</p>

          <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Shipping Details</h3>
          <p><strong>Shipping Address:</strong> ${customerAddress}</p>
          <p><strong>Estimated Delivery Date:</strong> ${deliveryDate}</p>

          <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff;">
            <thead>
              <tr style="background-color: #4CAF50; color: white;">
                <th style="padding: 12px; text-align: center;">Image</th>
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: left;">Design</th>
                <th style="padding: 12px; text-align: center;">Color</th>
                <th style="padding: 12px; text-align: center;">Size</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
          <p style="text-align: center;">Thank you for choosing our store!</p>

          <p style="text-align: center; font-weight: bold;">The E-Commerce Platform Team</p>
        </div>
      </body>
    </html>
  `;
}
