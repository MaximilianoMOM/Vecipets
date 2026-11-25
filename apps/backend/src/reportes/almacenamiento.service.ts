
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXTENSIONES_PERMITIDAS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class AlmacenamientoService {
  private readonly carpetaUploads = path.join(
    process.cwd(),
    'uploads',
    'reportes',
  );

  constructor() {
    this.asegurarDirectorio();
  }

  private asegurarDirectorio(): void {
    if (!fs.existsSync(this.carpetaUploads)) {
      fs.mkdirSync(this.carpetaUploads, { recursive: true });
    }
  }

  validarBuffer(buffer: Buffer, mimetype: string): string {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('El archivo de imagen está vacío.');
    }

    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException(
        'La fotografía excede el tamaño máximo permitido de 5 MB.',
      );
    }

    const extension = EXTENSIONES_PERMITIDAS[mimetype.toLowerCase()];
    if (!extension) {
      throw new BadRequestException(
        'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.',
      );
    }

    // Validación de números mágicos (firmas de archivo reales en binario)
    const esJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const esPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const esWebp =
      buffer.length > 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!esJpeg && !esPng && !esWebp) {
      throw new BadRequestException(
        'El archivo no corresponde a una imagen válida o está dañado.',
      );
    }

    return extension;
  }

  async guardarImagen(
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    this.asegurarDirectorio();

    const extension = this.validarBuffer(buffer, mimetype);
    const nombreArchivo = `reporte-${Date.now()}-${randomUUID()}.${extension}`;
    const rutaAbsoluta = path.join(this.carpetaUploads, nombreArchivo);

    await fs.promises.writeFile(rutaAbsoluta, buffer);

    // Ruta relativa para ser servida por el backend
    return `/uploads/reportes/${nombreArchivo}`;
  }
}
