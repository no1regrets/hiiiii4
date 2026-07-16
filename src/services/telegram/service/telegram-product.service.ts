import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostDto } from '../dto/post.dto';

@Injectable()
export class TelegramProductService {
  constructor(private prisma: PrismaService) {}

  async createPost(dto: PostDto) {
    const data = dto.data.split(',').map((item) => item.trim());
    return await this.prisma.products.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        productData: data,
      }
    });
  }

  async getProducts(page: number = 1, pageSize: number = 4) {
    return await this.prisma.products.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async getProductById(productId: string) {
    return await this.prisma.products.findUnique({
      where: { id: productId },
    });
  }

  async getPagesCount(pageSize: number) {
    const totalCount = await this.prisma.products.count();
    return Math.ceil(totalCount / pageSize);
  }

  async productDelivery(productId: string, userId: number) {
    const products = await this.getProductById(productId);
    if (!products) {
      throw new Error('Товар не найден');
    }
    const product = products.productData.shift();
    if(products?.productData?.length === 0) {
      await this.prisma.products.update({
        where: { id: productId },
        data: { productData: []},
      });
    }else{
      console.log(products.productData);
      await this.prisma.products.update({
      where: { id: productId },
      data: { productData: products.productData },
    });
    return product;
    }
  }
}
