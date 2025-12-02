import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  controllers: [CloudinaryController]
})
export class CloudinaryModule {}
