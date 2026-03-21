import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { isAllowedFileType, getFileTypeError } from '../../common/utils/file-validation';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string,
    context?: string,
    contextId?: string,
  ): Promise<FileEntity> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // Validate file type for security
    if (!isAllowedFileType(mimeType, originalName)) {
      throw new BadRequestException(getFileTypeError(mimeType, originalName));
    }

    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    const ext = extname(originalName);
    const filename = `${uuidv4()}${ext}`;

    // Organize by year/month
    const now = new Date();
    const subDir = join(
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
    );
    const dirPath = join(UPLOAD_DIR, subDir);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = join(subDir, filename);
    const fullPath = join(UPLOAD_DIR, filePath);

    await fs.writeFile(fullPath, fileBuffer);

    const fileEntity = this.fileRepository.create({
      filename,
      originalName,
      mimeType,
      size: fileBuffer.length,
      path: filePath,
      hash,
      uploadedBy,
      context: context ?? null,
      contextId: contextId ?? null,
    });

    const saved = await this.fileRepository.save(fileEntity);
    this.logger.log(`File uploaded: ${originalName} -> ${filename} (${saved.id})`);
    return saved;
  }

  async findById(id: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['uploadedByUser'],
    });
    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }
    return file;
  }

  async getFilePath(id: string): Promise<{ fullPath: string; file: FileEntity }> {
    const file = await this.findById(id);
    const fullPath = join(UPLOAD_DIR, file.path);

    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('File not found on disk');
    }

    return { fullPath, file };
  }

  async findByContext(context: string, contextId: string): Promise<FileEntity[]> {
    return this.fileRepository.find({
      where: { context, contextId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(uploadedBy: string): Promise<FileEntity[]> {
    return this.fileRepository.find({
      where: { uploadedBy },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const file = await this.findById(id);

    // Delete physical file
    try {
      const fullPath = join(UPLOAD_DIR, file.path);
      await fs.unlink(fullPath);
    } catch (err) {
      this.logger.warn(`Could not delete physical file: ${file.path}`);
    }

    await this.fileRepository.softRemove(file);
    this.logger.log(`File soft-deleted: ${file.originalName} (${id})`);
  }
}
