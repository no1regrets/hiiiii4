import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PrismaService} from "../../prisma/prisma.service"

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService){}
  async create(createPostDto: CreatePostDto) {
    let title = createPostDto.title
    let content = createPostDto.content
    let userId = createPostDto.userId
    return await this.prisma.post.create({
        data: {
            title: title,
            content: content,
            authorId: userId 
        }
    })
  }

  findAll() {
    return `This action returns all posts`;
  }

  findAllPostsByUserId(id: number) {
    // return this.prisma.post.findMany({
    //     where: {
    //         authorId: id
    //     }
    // })
    return this.prisma.user.findUnique({
      where: {
        id: id
      },
      include: {
        posts: true
      }
    })
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
