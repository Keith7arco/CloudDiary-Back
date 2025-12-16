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
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
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

  private videos: any[] = [];

  @Post('videos')
  async createVideo(@Body() body: any) {
    const { url, publicId, duration } = body;

    if (!url || !publicId) {
      throw new HttpException(
        'Missing video data',
        HttpStatus.BAD_REQUEST,
      );
    }

    const video = {
      id: Date.now(),
      url,
      publicId,
      duration,
      createdAt: new Date(),
    };

    this.videos.push(video);
    return video;
  }

  @Get('videos')
  async getVideos() {
    return this.videos;
  }

  @Delete('videos/:publicId')
  async deleteVideo(@Param('publicId') publicId: string) {
    this.videos = this.videos.filter(v => v.publicId !== publicId);
    return { deleted: true };
  }
}
