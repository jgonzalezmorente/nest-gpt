import * as path from 'path';
import * as fs from 'fs';
import { InternalServerErrorException } from '@nestjs/common';
import * as sharp from 'sharp';

export const downloadImageAsPng = async (url: string, fullPath: boolean = false) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new InternalServerErrorException('Download image was not possible');
    }
    const folderPath = path.resolve('./', './generated/images/');
    fs.mkdirSync(folderPath, { recursive: true });
    const imageNamePng = `${ new Date().getTime() }.png`;
    const buffer = Buffer.from(await response.arrayBuffer());
    // fs.writeFileSync(`${ folderPath }/${ imageNamePng }`, buffer);
    const completePath = path.join(folderPath, imageNamePng);
    await sharp(buffer)
        .png()
        .ensureAlpha()
        .toFile(completePath);
    return fullPath ? completePath : imageNamePng;
} 

export const downloadBase64ImageAsPng = async (base64Image: string, fullPath: boolean = false) => {
    base64Image = base64Image.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');  
    const folderPath = path.resolve('./', './generated/images/');
    fs.mkdirSync(folderPath, { recursive: true });  
    const imageNamePng = `${ new Date().getTime() }-64.png`;
    const completePath = path.join(folderPath, imageNamePng);
    await sharp(imageBuffer)
      .png()
      .ensureAlpha()
      .toFile(completePath);
    return imageNamePng;  
    return fullPath ? completePath : imageNamePng;
  }