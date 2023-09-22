import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}
  
  


  public example(username = 'user'): void {
    const templateHTML = `
    <html>
      <head>
        <title>Пример шаблона</title>
      </head>
      <body>
        <h1>Привет, ${username}!</h1>
        <p>Это ваше персональное письмо.</p>
      </body>
    </html>
  `;
  
    this
      .mailerService
      .sendMail({
        to: '',
        from: "", 
        subject: 'template', 
        html: templateHTML
      })
      .catch((err) => {
        console.log(err)
      });
  }
  
 
}