import { Response } from 'express';
import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto, ProsConsDiscusserDto } from './dtos';

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
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }
    res.end();
  }

}
