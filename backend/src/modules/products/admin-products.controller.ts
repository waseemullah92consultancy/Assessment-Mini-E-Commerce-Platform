import {
  Controller,
  Post,
  Param,
  Body,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { ProductsService } from './products.service';
import { AddImageUrlDto } from './dto/add-image.dto';
import { Roles } from '../../common/decorators/roles.decorator';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const multerOptions = {
  storage: diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    },
    filename: (_req: any, file: Express.Multer.File, cb: any) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException('Only JPEG, PNG, and WebP images are allowed'),
        false,
      );
    }
  },
};

@Controller('admin/products')
@Roles('admin')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Primary: add an image by URL */
  @Post(':id/image')
  addImageUrl(@Param('id') id: string, @Body() dto: AddImageUrlDto) {
    return this.productsService.addImageUrl(id, dto.imageUrl);
  }

  /** Secondary: upload an image file (max 5 MB, jpg/png/webp) */
  @Post(':id/image/upload')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.productsService.addImageFile(id, file.filename);
  }
}
