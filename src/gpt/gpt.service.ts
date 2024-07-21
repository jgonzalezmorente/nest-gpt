import * as path from 'path';
import * as fs from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { orthographyCheckUseCase, prosConsDiscusserStreamUseCase, prosConsDiscusserUseCase, translateUseCase, textToAudioUseCase, audioToTextUseCase } from './use-cases';
import { OrthographyDto, TextToAudioDto, TranslateDto, ProsConsDiscusserDto, AudioToTextDto } from './dtos';

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

    async translateText({ prompt, lang }: TranslateDto) {
        return await translateUseCase( this.openai, { prompt, lang });
    }

    async textToAudio({ prompt, voice }: TextToAudioDto ) {
        return await textToAudioUseCase( this.openai, { prompt, voice });
    }

    async textToAudioGetter(fileId: string) {
        const filePath = path.resolve(__dirname, '../../generated/audios/', `${fileId}.mp3`);        
        const wasFound = fs.existsSync(filePath);
        if (!wasFound) throw new NotFoundException(`File ${ fileId } not found`);
        return filePath;
    }

    async audioToText(audioFile: Express.Multer.File, audioToTextDto?: AudioToTextDto) {
        const { prompt } = audioToTextDto;
        return await audioToTextUseCase(this.openai, { audioFile, prompt });
    }

}
