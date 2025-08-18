import { Injectable } from '@nestjs/common';

@Injectable()
export class SynthesizerService {
  private readonly sampleRate = 44100;
  private readonly bitDepth = 16;
  private readonly channels = 1;

  async generateEnvironmentAudio(
    environmentId: string,
    duration: number,
    volume: number
  ): Promise<Buffer> {
    try {
      console.log(`🎵 Generating ${environmentId} audio for ${duration}ms at volume ${volume}`);
      
      const supportedEnvironments = ['rain', 'ocean', 'fire', 'wind', 'frequency', 'cafe', 'storm', 'forest'];
      
      if (!supportedEnvironments.includes(environmentId)) {
        throw new Error(`Unsupported environment: ${environmentId}`);
      }
      
      const samples = this.generateSamples(environmentId, duration, volume);
      return this.samplesToWav(samples);
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  private generateSamples(environmentId: string, duration: number, volume: number): Float32Array {
    const numSamples = Math.floor((duration / 1000) * this.sampleRate);
    const samples = new Float32Array(numSamples);
    
    switch (environmentId) {
      case 'rain':
        return this.generateRain(samples, volume);
      case 'ocean':
        return this.generateOcean(samples, volume);
      case 'fire':
        return this.generateFire(samples, volume);
      case 'wind':
        return this.generateWind(samples, volume);
      case 'frequency':
        return this.generateFrequency(samples, volume, 432); // 432Hz
      case 'cafe':
        return this.generateCafe(samples, volume);
      case 'storm':
        return this.generateStorm(samples, volume);
      case 'forest':
        return this.generateForest(samples, volume);
      default:
        return this.generateWhiteNoise(samples, volume);
    }
  }

  private generateRain(samples: Float32Array, volume: number): Float32Array {
    // Rain = filtered white noise with random droplet impacts
    for (let i = 0; i < samples.length; i++) {
      const noise = (Math.random() * 2 - 1) * 0.3;
      const droplet = Math.random() < 0.001 ? Math.random() * 0.5 : 0;
      samples[i] = (noise + droplet) * volume;
    }
    return this.lowPassFilter(samples, 0.7);
  }

  private generateOcean(samples: Float32Array, volume: number): Float32Array {
    // Ocean = low frequency sine waves with some noise
    for (let i = 0; i < samples.length; i++) {
      const t = i / this.sampleRate;
      const wave1 = Math.sin(2 * Math.PI * 0.1 * t) * 0.5;
      const wave2 = Math.sin(2 * Math.PI * 0.05 * t) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.1;
      samples[i] = (wave1 + wave2 + noise) * volume;
    }
    return samples;
  }

  private generateFire(samples: Float32Array, volume: number): Float32Array {
    // Fire = crackle noise with envelope modulation
    for (let i = 0; i < samples.length; i++) {
      const envelope = Math.random() < 0.02 ? Math.random() : 0.1;
      const crackle = (Math.random() * 2 - 1) * envelope;
      const hiss = (Math.random() * 2 - 1) * 0.05;
      samples[i] = (crackle + hiss) * volume;
    }
    return this.highPassFilter(samples, 0.3);
  }

  private generateWind(samples: Float32Array, volume: number): Float32Array {
    // Wind = low frequency noise with slow modulation
    for (let i = 0; i < samples.length; i++) {
      const t = i / this.sampleRate;
      const modulation = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
      const noise = (Math.random() * 2 - 1) * modulation;
      samples[i] = noise * volume;
    }
    return this.lowPassFilter(samples, 0.5);
  }

  private generateFrequency(samples: Float32Array, volume: number, freq: number): Float32Array {
    // Pure tone at specified frequency
    for (let i = 0; i < samples.length; i++) {
      const t = i / this.sampleRate;
      samples[i] = Math.sin(2 * Math.PI * freq * t) * volume;
    }
    return samples;
  }

  private generateCafe(samples: Float32Array, volume: number): Float32Array {
    // Cafe = brown noise with occasional coffee machine sounds
    let brownNoise = 0;
    for (let i = 0; i < samples.length; i++) {
      const white = Math.random() * 2 - 1;
      brownNoise = (brownNoise + white * 0.02) * 0.99;
      const machine = Math.random() < 0.0005 ? Math.sin(2 * Math.PI * 1000 * i / this.sampleRate) * 0.3 : 0;
      samples[i] = (brownNoise + machine) * volume;
    }
    return samples;
  }

  private generateStorm(samples: Float32Array, volume: number): Float32Array {
    // Storm = rain + wind + occasional thunder
    const rain = this.generateRain(new Float32Array(samples.length), 0.7);
    const wind = this.generateWind(new Float32Array(samples.length), 0.5);
    
    for (let i = 0; i < samples.length; i++) {
      const thunder = Math.random() < 0.00001 ? (Math.random() * 2 - 1) * 2 : 0;
      samples[i] = (rain[i] + wind[i] + thunder) * volume;
    }
    return samples;
  }

  private generateForest(samples: Float32Array, volume: number): Float32Array {
    // Forest = leaves rustling + bird chirps
    const rustling = this.generateWind(new Float32Array(samples.length), 0.3);
    
    for (let i = 0; i < samples.length; i++) {
      let bird = 0;
      if (Math.random() < 0.001) {
        const chirpFreq = 2000 + Math.random() * 2000;
        bird = Math.sin(2 * Math.PI * chirpFreq * i / this.sampleRate) * 0.2;
      }
      samples[i] = (rustling[i] + bird) * volume;
    }
    return samples;
  }

  private generateWhiteNoise(samples: Float32Array, volume: number): Float32Array {
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (Math.random() * 2 - 1) * volume;
    }
    return samples;
  }

  private lowPassFilter(samples: Float32Array, alpha: number): Float32Array {
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
      previous = previous + alpha * (samples[i] - previous);
      samples[i] = previous;
    }
    return samples;
  }

  private highPassFilter(samples: Float32Array, alpha: number): Float32Array {
    let previous = 0;
    let previousFiltered = 0;
    for (let i = 0; i < samples.length; i++) {
      const current = samples[i];
      const filtered = alpha * (previousFiltered + current - previous);
      samples[i] = filtered;
      previous = current;
      previousFiltered = filtered;
    }
    return samples;
  }

  private samplesToWav(samples: Float32Array): Buffer {
    // Convert Float32Array to Int16Array for WAV format
    const int16Array = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      int16Array[i] = Math.max(-32767, Math.min(32767, samples[i] * 32767));
    }

    // Create WAV header
    const arrayBuffer = new ArrayBuffer(44 + int16Array.length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Array.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, this.channels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * this.channels * 2, true);
    view.setUint16(32, this.channels * 2, true);
    view.setUint16(34, this.bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, int16Array.length * 2, true);
    
    // Audio data
    const bytes = new Uint8Array(arrayBuffer);
    const offset = 44;
    for (let i = 0; i < int16Array.length; i++) {
      const sample = int16Array[i];
      bytes[offset + i * 2] = sample & 0xFF;
      bytes[offset + i * 2 + 1] = (sample >> 8) & 0xFF;
    }
    
    return Buffer.from(arrayBuffer);
  }
}