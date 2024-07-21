import * as fs from 'fs';
import OpenAI from "openai";

interface Options {
    prompt: string;
    audioFile: Express.Multer.File
}

export const audioToTextUseCase = async (openai: OpenAI, options: Options) => {
    const { prompt, audioFile } = options;    
    const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(audioFile.path),
        prompt: prompt, // Mismo idioma del audio
        language: 'es',
        response_format: 'verbose_json', // 'srt', 'vtt'
    });    
    return response;
}