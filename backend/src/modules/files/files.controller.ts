import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Req,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'fs';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Files')
@ApiBearerAuth('access-token')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        context: { type: 'string' },
        contextId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async upload(
    @Req() req: FastifyRequest,
    @CurrentUser() user: User,
  ) {
    const data = await (req as any).file();
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const context = data.fields?.context?.value as string | undefined;
    const contextId = data.fields?.contextId?.value as string | undefined;

    return this.filesService.upload(
      fileBuffer,
      data.filename,
      data.mimetype,
      user.id,
      context,
      contextId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({ status: 200, description: 'File metadata' })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: FastifyReply,
  ) {
    const { fullPath, file } = await this.filesService.getFilePath(id);
    const stream = createReadStream(fullPath);

    res.header('Content-Type', file.mimeType);
    res.header(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    );
    res.header('Content-Length', String(file.size));

    return res.send(stream);
  }

  @Get('context/:context/:contextId')
  @ApiOperation({ summary: 'Get files by context' })
  findByContext(
    @Param('context') context: string,
    @Param('contextId') contextId: string,
  ) {
    return this.filesService.findByContext(context, contextId);
  }

  @Get('user/my')
  @ApiOperation({ summary: 'Get files uploaded by current user' })
  getMyFiles(@CurrentUser() user: User) {
    return this.filesService.findByUser(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(id);
  }
}
