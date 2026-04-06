import {Injectable} from "@nestjs/common"
import {PrismaService} from "../prisma/prisma.service"
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto"

@Injectable()
export class UserService{
    constructor(private readonly prisma: PrismaService){}
    async createUser(dto: CreateUserDto){
        return await this.prisma.user.create({
            data:{
                email: dto.email,
                name: dto.name,
            }
        })
    }
    async updateUser(updateUserDto: UpdateUserDto){
        return await this.prisma.user.update({
            where: { id: updateUserDto.id },
            data: {
                email: updateUserDto.email,
                name: updateUserDto.name,
            }
        })
    }
    async deleteUser(id: number){
        return await this.prisma.user.delete({
            where: { id: id }
        })
    }
    async getUserInfo(email: string){
        return await this.prisma.user.findUniqueOrThrow({
            where: { email: email }
        })
    }
    async updateRole(role: string, id: number){
        return await this.prisma.user.update({
            where: { id: id },
            data: {
                roll: role
            }
        })
    }
}