import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || ''
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';

const sendEmail = async (to: string, subject: string, text: string, html: string): Promise<any> => {
    if (!process.env.MAILGUN_API_KEY || !DOMAIN) {
        throw new Error('Mailgun API key or domain not set in environment variables');
    }

    try {
        const msg = await mg.messages.create(DOMAIN, {
            from: "Codeifyx <verification@codeifyx.com>",
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

export default sendEmail;