import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinaryType } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof cloudinaryType) {}

  uploadFile(file: Express.Multer.File, folder = process.env.CLOUDINARY_FOLDER || 'my-photos') {
    return new Promise<any>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async listFiles(maxResults = 100) {
    const folder = process.env.CLOUDINARY_FOLDER || 'my-cloud';
    const res = await this.cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();
    return res.resources;
  }

  async getFile(publicId: string) {
    return this.cloudinary.api.resource(publicId, { resource_type: 'auto' });
  }

  async deleteFile(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
      .then((res) => {
        if (res.result === 'not found' || res.result === '0') {
          return this.cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
        return res;
      });
  }
}
