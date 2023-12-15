import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transport configuration for sending verification emails.
 *
 * @type {object} transporter - Nodemailer transport object.
 * @property {string} service - The email service to be used (e.g., 'gmail').
 * @property {number} port - The port number for email service (e.g., 587).
 * @property {boolean} secure - Indicates if a secure connection should be established (e.g., true).
 * @property {object} tls - TLS (Transport Layer Security) configuration.
 * @property {boolean} tls.rejectUnauthorized - Indicates whether to reject unauthorized connections.
 * @property {string} tls.minVersion - The minimum TLS version to use (e.g., 'TLSv1.2').
 * @property {object} auth - Authentication details for the email service.
 * @property {string} auth.user - The email user for authentication.
 * @property {string} auth.pass - The email password for authentication.
 */
let transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: true,
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  auth: {
    user: "testemail9121@gmail.com",
    pass: 'tpizygcgppixhjtd'
  },
});

export default transporter;
