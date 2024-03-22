import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { orthographyCheckUseCase, prosConsDiscusserStreamUseCase, prosConsDiscusserUseCase } from './use-cases';
import { OrthographyDto } from './dtos';
import { ProsConsDiscusserDto } from './dtos/pros-cons-discusser.dto';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    async orthographyCheck(orthography: OrthographyDto) {
        return await orthographyCheckUseCase( this.openai, {
            prompt: orthography.prompt
        });
    }

    async prosConsDiscusser(prosConsDiscusserDto: ProsConsDiscusserDto) {
        return await prosConsDiscusserUseCase( this.openai, {
            prompt: prosConsDiscusserDto.prompt
        });
    }

    async prosConsDiscusserStream(prosConsDiscusserDto: ProsConsDiscusserDto) {
        return await prosConsDiscusserStreamUseCase( this.openai, {
            prompt: prosConsDiscusserDto.prompt
        });
    }

}
