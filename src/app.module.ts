import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { User, UserSchema } from './users/schemas/user.schema';
import { UsersController } from './users/users.controller';
import {JwtService} from '@nestjs/jwt'
import { FilesModule } from './files/files.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import { SendMailService } from './mail/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';  
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { MailModule } from './mail/mail.module';
import * as path from 'path';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve( __dirname, 'static'),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forRoot(''),
    UsersModule,
    AuthModule,
    FilesModule,
    MailModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: "",
            pass: ""
          },
        },
        defaults: {
          from:'',
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
