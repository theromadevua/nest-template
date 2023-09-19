import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}
 
    async createUser(dto: CreateUserDto) {
        const user = await this.userModel.create(dto);
        return user;
    }

    async getUserByEmail(email: string){
        const user = await this.userModel.findOne({email})
        return user;
    }
    
}