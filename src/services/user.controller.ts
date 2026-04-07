import {Controller, Post, Query, Body, Patch, Delete, Param, Get, Put, ParseIntPipe} from "@nestjs/common"
import {UserService} from "./user.services"
import {CreateUserDto, UpdateUserDto} from "./dto/user.dto"



@Controller("/user")
export class UserController {
    constructor (
        private readonly userService: UserService
    ){}

    @Get()
    async getUserInfo(@Query("email") email: string){
        return await this.userService.getUserInfo(email)
    }

    @Post()
    async createUser(@Query() dto: CreateUserDto){
        return await this.userService.createUser(dto)
    }
    @Patch()
    async updateUser(@Body() updateUserDto: UpdateUserDto){
            return await this.userService.updateUser(updateUserDto)
    }
    @Delete(":id")
    async deleteUser(@Param("id") id: number){
        return await this.userService.deleteUser(id)
    }
    @Put(":id")
    async updateRole(@Query("roll") role: string, @Param("id", ParseIntPipe) id: number){
        let role2 = decodeURI(role)
        return await this.userService.updateRole(role2, id)
    }
}
