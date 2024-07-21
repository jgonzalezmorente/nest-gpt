import type { Response } from 'express';
import { Body, Controller, FileTypeValidator, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GptService } from './gpt.service';
import { AudioToTextDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  @HttpCode(200)
  ortographyCheck(
    @Body() orthographyDto: OrthographyDto
  ) {    
    return this.gptService.orthographyCheck(orthographyDto);
  }

  @Post('pros-cons-discusser')
  @HttpCode(200)
  prosConsDiscusser(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto
  ) {
    return this.gptService.prosConsDiscusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')  
  async prosConsDiscusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response
  ) {
    const stream = await this.gptService.prosConsDiscusserStream(prosConsDiscusserDto);
    res.setHeader( 'Content-Type', 'application/json' );
    res.status( HttpStatus.OK );
    for await( const chunk of stream ) {
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }
    res.end();
  }

  @Post('translate')
  @HttpCode(200)
  translate(
    @Body() translateDto: TranslateDto
  ) {
    return this.gptService.translateText( translateDto );
  }

  @Post('text-to-audio')
  async textToAudio(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response
  ) {
    const filePath = await this.gptService.textToAudio( textToAudioDto );
    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:fileId')
  async textToAudioGetter(    
    @Res() res: Response,
    @Param('fileId') fileId: string,
  ) {
    const filePath = await this.gptService.textToAudioGetter( fileId );
    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  //* Desglose del Proceso 
  //* 1. Interceptor de archivos (`FileInterceptor`):
  //    - El interceptor `FileInterceptor` está configurado para manejar la subida de archivos. Este interceptor utiliza `multer` bajo el capó para procesar la subida de archivos.
  //    - `FileInterceptor` se encarga de recibir el archivo desde la solicitud HTTP y pasarlo al middleware de `multer` para que lo procese y lo almacene.
  //    - El nombre 'file' en el FileInterceptor se refiere al campo de formulario que contiene el archivo subido.
  //* 2. Configuración del almacenamiento:
  //    - Dentro de `FileInterceptor`, se configura el almacenamiento usando `diskStorage` donde se especifica la ubicación (`destination`) y el nombre del archivo (`filename`).
  //* 3. Proceso de subida del archivo:
  //    - Cuando una solicitud HTTP POST con un archivo adjunto llega a la ruta `'audio-to-text'`, `multer` intercepta esta solicitud, procesa el archivo y lo almacena según la configuración proporcionada.
  //    - Durante este proceso, `multer` añade el archivo subido a la propiedad `file` del objeto de solicitud (`req`).
  //* 4. Decorador `@UploadedFile`:
  //    - El decorador `@UploadedFile` indica que el parámetro `file` del método `audioToText` debe ser inyectado con el archivo subido que fue procesado por `multer`.
  //    - `NestJS` utiliza metadatos y su sistema de inyección de dependencias para saber que debe buscar en la propiedad `file` del objeto de solicitud (`req`) y pasar ese archivo al método como argumento.
  //*  En resumen:
  //1. La solicitud HTTP POST llega a la ruta `'audio-to-text'` con un archivo adjunto.
  //2. `FileInterceptor` intercepta la solicitud y usa `multer` para procesar el archivo.
  //3. `multer` almacena el archivo y lo agrega a `req.file`.
  //4. `@UploadedFile` decorador en el método `audioToText` le indica a `NestJS` que debe inyectar `req.file` en el parámetro `file` del método.
  //5. El método `audioToText` se ejecuta con el archivo subido disponible en el parámetro `file`.  
  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', { 
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${ new Date().getTime() }.${ fileExtension }`;
          return callback(null, fileName); // Una vez que se ha determinado el nombre del fichero, el callback hace que multer continue con el proceso de almacenar el fichero
        }
      })
    })
  )
  async audioToText(
    @UploadedFile( 
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 5, message: 'File is bigger hant 5mb' }),
          new FileTypeValidator({fileType: 'audio/*'})
        ]
      })
    ) file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto
  ) {    
    return this.gptService.audioToText(file, audioToTextDto);
  }

}
