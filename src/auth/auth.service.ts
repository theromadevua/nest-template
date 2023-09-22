import { Injectable, HttpException,HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import {JwtService} from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from './schemas/token.schema';
import { User } from 'src/users/schemas/user.schema';
import { SendMailService } from 'src/mail/mail.service';
@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private sendMailService: SendMailService,
        @InjectModel(Token.name) private tokenModel: Model<Token>,
        @InjectModel(User.name) private userModel: Model<User>
    ){}

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto)
        const accessToken = await this.generateAccesToken(user)
        const refreshToken =  await this.generateRefreshToken(user)

        const savedToken = await this.saveToken({refreshToken: refreshToken.token, userId: user._id})
        if(!savedToken){
            throw new HttpException('Токен не сохранен', HttpStatus.BAD_REQUEST)
        }
        this.sendMailService.example()
        
        return {refreshToken: refreshToken.token, accessToken: accessToken.token}
    }

    async registration(userDto: CreateUserDto){
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }
        
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({...userDto, password: hashPassword})

        const accessToken = await this.generateAccesToken(user)
        const refreshToken =  await this.generateRefreshToken(user)

        const savedToken = await this.saveToken({refreshToken: refreshToken.token, userId: user._id})
        if(!savedToken){
            throw new HttpException('Токен не сохранен', HttpStatus.BAD_REQUEST)
        }

        return {accessToken: accessToken.token, refreshToken: refreshToken.token}
    }

    async refresh(refreshToken: string){
       
        if(!refreshToken){
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }

        const tokenInDb = await this.tokenModel.findOne({token: refreshToken})
        if(!tokenInDb){
            throw new HttpException('Пользователь не авторизован', HttpStatus.BAD_REQUEST)
        }
        


        const tokenData = await this.jwtService.verify(refreshToken);
        const user = await this.userModel.findOne({email: tokenData.email})
        if(!user){
            throw new HttpException('Пользователь с таким email не существует', HttpStatus.BAD_REQUEST)
        }



        
        const newAccessToken = await this.generateAccesToken(user)
        const newRefreshToken =  await this.generateRefreshToken(user)


        const savedToken = await this.saveToken({refreshToken: newRefreshToken.token, userId: user.id})
        if(!savedToken){
            throw new HttpException('Токен не сохранен', HttpStatus.BAD_REQUEST)
        }
       

        return {refreshToken: newRefreshToken.token, accessToken: newAccessToken.token}
    }

    private async saveToken({refreshToken, userId}){
       
        const existToken = await this.tokenModel.findOne({user: userId})

        if(existToken){
           
            existToken.token = refreshToken;
            await existToken.save()
         
            return existToken
        }

        
        return await this.tokenModel.create({token: refreshToken, user: userId})
    }

    private async generateAccesToken(user: any) {
        const payload = {email: user.email, id: user._id}
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async generateRefreshToken(user: any) {
        const payload = {email: user.email, id: user._id, expiresIn: '7d'}
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        throw new UnauthorizedException({message: 'Некорректный емайл или пароль'})
    }

}
