import { Body, Controller, Post, Get, Req, Res, UseGuards} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import {Request, Response} from 'express'
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto, @Res() res: Response) {
        const userData = await this.authService.registration(userDto)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return res.json(userData)
    }

    @Post('/login')
    async login(@Body() userDto: CreateUserDto, @Res() res: Response) {
        console.log('ds')
        const userData:any = await this.authService.login(userDto)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
     
        return res.json(userData)
    }

    @Get('/refresh')
    async refresh(@Req() req: Request, @Res() res: Response) {
        const tokens = await this.authService.refresh(req.cookies.refreshToken)
        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return res.json(tokens.accessToken)
    }

}
