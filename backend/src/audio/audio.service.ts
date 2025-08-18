import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { SynthesizerService } from './synthesizer.service';
import { FreesoundService } from './freesound.service';

export interface AudioEnvironment {
  id: string;
  name: string;
  description: string;
  type: 'synthesized' | 'freesound' | 'hybrid';
  icon: string;
  gradient: string;
}

@Injectable()
export class AudioService {
  constructor(
    private readonly synthesizerService: SynthesizerService,
    private readonly freesoundService: FreesoundService,
  ) {}

  getAvailableEnvironments(): AudioEnvironment[] {
    return [
      {
        id: 'rain',
        name: 'Chuva Suave',
        description: 'Som relaxante de chuva leve caindo',
        type: 'synthesized',
        icon: '🌧️',
        gradient: 'from-blue-600 to-indigo-800'
      },
      {
        id: 'forest',
        name: 'Floresta Tropical',
        description: 'Pássaros cantando e folhas balançando',
        type: 'synthesized',
        icon: '🌲',
        gradient: 'from-green-600 to-emerald-800'
      },
      {
        id: 'ocean',
        name: 'Oceano Calmo',
        description: 'Ondas suaves tocando a praia',
        type: 'synthesized',
        icon: '🌊',
        gradient: 'from-cyan-600 to-blue-800'
      },
      {
        id: 'fire',
        name: 'Fogueira Noturna',
        description: 'Crepitar reconfortante das chamas',
        type: 'synthesized',
        icon: '🔥',
        gradient: 'from-orange-600 to-red-700'
      },
      {
        id: 'wind',
        name: 'Vento Suave',
        description: 'Brisa gentil através das árvores',
        type: 'synthesized',
        icon: '💨',
        gradient: 'from-slate-600 to-gray-800'
      },
      {
        id: 'frequency',
        name: 'Frequência 432Hz',
        description: 'Tom puro para meditação profunda',
        type: 'synthesized',
        icon: '🎼',
        gradient: 'from-purple-600 to-violet-800'
      },
      {
        id: 'cafe',
        name: 'Café Urbano',
        description: 'Ambiente aconchegante de cafeteria',
        type: 'synthesized',
        icon: '☕',
        gradient: 'from-amber-700 to-brown-800'
      },
      {
        id: 'storm',
        name: 'Tempestade Distante',
        description: 'Trovões suaves ao longe',
        type: 'synthesized',
        icon: '⚡',
        gradient: 'from-gray-700 to-slate-900'
      }
    ];
  }

  async generateEnvironmentAudio(
    environmentId: string,
    duration: number,
    volume: number
  ): Promise<Buffer> {
    const environment = this.getAvailableEnvironments().find(env => env.id === environmentId);
    
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    // Priority 1: Always try synthesized generation first
    try {
      console.log(`🎵 Generating ${environmentId} using synthesizer...`);
      return await this.synthesizerService.generateEnvironmentAudio(environmentId, duration, volume);
    } catch (synthError: any) {
      console.warn(`Synthesizer failed for ${environmentId}:`, synthError.message);
      
      // Priority 2: Fallback to Freesound if synthesis fails
      try {
        console.log(`🔄 Falling back to Freesound for ${environmentId}...`);
        return await this.freesoundService.generateEnvironmentAudio(environmentId, duration, volume);
      } catch (freesoundError: any) {
        console.warn(`Freesound also failed for ${environmentId}:`, freesoundError.message);
        
        // Priority 3: Return a simple text message if everything fails
        const fallbackMessage = `Audio generation failed for ${environment.name}. Please check logs.`;
        return Buffer.from(fallbackMessage, 'utf-8');
      }
    }
  }

  async streamEnvironmentAudio(
    environmentId: string,
    options: any,
    res: Response
  ): Promise<void> {
    // Stream audio in chunks for real-time playback
    const environment = this.getAvailableEnvironments().find(env => env.id === environmentId);
    
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    // Generate audio in 5-second chunks
    const chunkDuration = 5000; // 5 seconds
    const totalDuration = options.duration || 300000; // 5 minutes default
    const chunks = Math.ceil(totalDuration / chunkDuration);

    for (let i = 0; i < chunks; i++) {
      const audioChunk = await this.generateEnvironmentAudio(
        environmentId,
        chunkDuration,
        options.volume || 0.7
      );
      
      res.write(audioChunk);
      
      // Add small delay to simulate real-time streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.end();
  }

  async searchFreesoundSamples(query: string) {
    return this.freesoundService.searchSamples(query);
  }

  private async mixAudioSources(
    synthesized: Buffer,
    samples: Buffer[],
    volume: number
  ): Promise<Buffer> {
    // Simple audio mixing logic - in production, use a proper audio library
    // For now, return the synthesized audio
    return synthesized;
  }
}