const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});

const DOMAIN = process.env.MAILGUN_DOMAIN;

const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = await mg.messages.create(DOMAIN, {
            from: "Codeifyx <mailgun@codeifyx.com>",
            to: [to],
            subject: subject,
            text: text,
            html: html
        });
        console.log('Email sent:', msg);
        return msg;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;