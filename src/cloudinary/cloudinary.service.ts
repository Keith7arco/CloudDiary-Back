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
          resource_type: 'auto', // acepta image y video
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // file.buffer viene si usamos multer memoryStorage (ver controller)
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async listFiles(maxResults = 100) {
    // Usa search API de Cloudinary
    const folder = process.env.CLOUDINARY_FOLDER || 'my-cloud';
    const res = await this.cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();
    return res.resources;
  }

  async getFile(publicId: string) {
    // publicId debe recibirlo en formato "my-cloud/archivo" o solo "archivo" dependiendo de cómo lo guardes
    // Obtenemos detalles del recurso
    return this.cloudinary.api.resource(publicId, { resource_type: 'auto' });
  }

  async deleteFile(publicId: string) {
    // Para imagenes/videos resource_type should be 'image' or 'video' or 'auto' - destroy supports resource_type
    // Intentamos destruir en resource_type 'auto' (en cloudinary se recomienda indicar resource_type correcto si lo conoces)
    return this.cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
      .then((res) => {
        // si no existe como image, intentamos con video
        if (res.result === 'not found' || res.result === '0') {
          return this.cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
        return res;
      });
  }
}
