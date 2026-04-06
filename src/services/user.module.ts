import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.services';
import { PrismaService } from "../prisma/prisma.service"
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [PostsModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
