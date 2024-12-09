import process from 'node:process';

export  function emailStructure (email: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: html,
  }

  return mailOptions
}