import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}`,
            to,
            subject,
            html
        })

        return true;
    } catch (error) {
        console.log("Error sending mail", error);
        return false;
    }
}