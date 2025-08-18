import { Controller, Get, Post, Param, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get('environments')
  getAvailableEnvironments() {
    return this.audioService.getAvailableEnvironments();
  }

  @Get('generate/:environmentId')
  async generateAudio(
    @Param('environmentId') environmentId: string,
    @Query('duration') duration?: string,
    @Query('volume') volume?: string,
    @Res() res?: Response
  ) {
    const durationMs = duration ? parseInt(duration) * 1000 : 30000; // Default 30s
    const volumeLevel = volume ? parseFloat(volume) : 0.7; // Default 70%

    const audioData = await this.audioService.generateEnvironmentAudio(
      environmentId,
      durationMs,
      volumeLevel
    );

    if (res) {
      // Check if we have real audio data or just text
      const isRealAudio = audioData.length > 1000; // Simple heuristic
      
      res.set({
        'Content-Type': isRealAudio ? 'audio/wav' : 'text/plain',
        'Content-Length': audioData.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(audioData);
    }

    return audioData;
  }

  @Post('stream/:environmentId')
  async streamAudio(
    @Param('environmentId') environmentId: string,
    @Body() options: any,
    @Res() res: Response
  ) {
    // For real-time streaming
    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache'
    });

    await this.audioService.streamEnvironmentAudio(
      environmentId,
      options,
      res
    );
  }

  @Get('search')
  async searchFreesound(@Query('query') query: string) {
    return this.audioService.searchFreesoundSamples(query);
  }
}