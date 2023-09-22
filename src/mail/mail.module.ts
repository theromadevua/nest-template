import { Module } from '@nestjs/common';
import { SendMailService } from './mail.service';

@Module({
    providers: [SendMailService],
    exports: [SendMailService]
})
export class MailModule {}
