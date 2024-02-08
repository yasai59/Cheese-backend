import { Resend } from "resend";

class MailSender {
  private static instance: MailSender;

  private resend: Resend = new Resend();

  private constructor() {}

  public static getInstance(): MailSender {
    if (!MailSender.instance) {
      MailSender.instance = new MailSender();
    }
    return MailSender.instance;
  }

  public sendMail(
    email: string,
    subject: string,
    message: string,
    from?: string | undefined
  ): void {
    this.resend.emails.send({
      from: from ?? "Yasai <no-reply@yasai59.com>",
      to: [email],
      subject: subject,
      html: message,
    });

    console.log(`Sending mail to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
  }
}

export default MailSender;
