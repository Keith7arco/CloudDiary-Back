import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage, memoryStorage } from 'multer';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Upload - usamos memoryStorage para tener file.buffer
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return result;
    } catch (err) {
      console.error(err);
      throw new HttpException('Upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // List files
  @Get('files')
  async listFiles() {
    try {
      const resources = await this.cloudinaryService.listFiles();
      return resources;
    } catch (err) {
      console.error(err);
      throw new HttpException('List failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get details about a file by public_id (url safe) - publicId param must be url encoded if contains slashes
  @Get('file/:publicId')
  async getFile(@Param('publicId') publicId: string) {
    try {
      const decoded = decodeURIComponent(publicId);
      const res = await this.cloudinaryService.getFile(decoded);
      return res;
    } catch (err) {
      console.error(err);
      throw new HttpException('Get file failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete by public_id
  @Delete('file/:publicId')
  async deleteFile(@Param('publicId') publicId: string) {
    try {
      const decoded = decodeURIComponent(publicId);
      const res = await this.cloudinaryService.deleteFile(decoded);
      return res;
    } catch (err) {
      console.error(err);
      throw new HttpException('Delete failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
