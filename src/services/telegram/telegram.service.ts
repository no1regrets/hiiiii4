import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TelegramService {
    constructor(private prisma: PrismaService) {}

    async getGroupByFirstNumber(number: string){
        const group = this.prisma.group.findMany({});
        let k = [];
        (await group).forEach(g => {
            let i = g.name.split('-')[0]
            if(i === number){
                k.push(g)
            }
        });
        if(k.length < 1){
            return ''
        }else{
            return k
        }
    }

    async getUserByLastName( last_name){
        const allUser = await this.prisma.user.findMany({
            where:{
                teacher: true
            }
        })
        let k = [];

        allUser.forEach(u => {
            let l = u.name.split(' ')[0]
            if(l === last_name){
                k.push(u)
            }
        });

        if(k.length < 1){
            return ''
        }else{
            return k
        }
    }

    async getUserByName(name){
        return this.prisma.user.findFirst({
            where:{
                name: name,
                teacher: true
            }
        })
    }

    async getPart(name, date){
        const parts = await this.prisma.part.findMany({
            where: {
                type: 'parts',
                teacher: name,
                date: date
            }
        })
        return parts.filter(v => v.group != 'empty')
    }

    async getPartByGroup(name, date){
        const parts = await this.prisma.part.findMany({
            where: {
                type: 'parts',
                group: name,
                date: date
            }
        })
        return parts.filter(v => v.teacher != 'empty')
    }
} 
 
