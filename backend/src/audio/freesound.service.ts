import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface FreesoundSample {
  id: number;
  name: string;
  description: string;
  download: string;
  preview_hq_mp3: string;
  duration: number;
  tags: string[];
}

interface FreesoundResponse {
  count: number;
  results: FreesoundSample[];
}

@Injectable()
export class FreesoundService {
  private readonly baseUrl = 'https://freesound.org/apiv2';
  private readonly apiKey = process.env.FREESOUND_API_KEY || 'YOUR_API_KEY_HERE';

  async searchSamples(query: string, page = 1, pageSize = 20): Promise<FreesoundResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/text/`, {
        params: {
          query,
          page,
          page_size: pageSize,
          fields: 'id,name,description,download,previews,duration,tags',
          token: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching Freesound:', error);
      throw new Error('Failed to search Freesound samples');
    }
  }

  async downloadSample(sampleId: number): Promise<Buffer> {
    try {
      // First get the sample details
      const sampleResponse = await axios.get(`${this.baseUrl}/sounds/${sampleId}/`, {
        params: {
          token: this.apiKey
        }
      });

      const downloadUrl = sampleResponse.data.download;
      
      // Download the audio file
      const audioResponse = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Token ${this.apiKey}`
        }
      });

      return Buffer.from(audioResponse.data);
    } catch (error) {
      console.error('Error downloading sample:', error);
      throw new Error('Failed to download sample');
    }
  }

  async getEnvironmentSamples(environmentId: string): Promise<Buffer[]> {
    const queries = this.getEnvironmentQueries(environmentId);
    const samples: Buffer[] = [];

    for (const query of queries) {
      try {
        const searchResult = await this.searchSamples(query, 1, 5);
        
        if (searchResult.results.length > 0) {
          // Download the first few samples
          for (const sample of searchResult.results.slice(0, 2)) {
            try {
              const audioBuffer = await this.downloadSample(sample.id);
              samples.push(audioBuffer);
            } catch (downloadError) {
              console.warn(`Failed to download sample ${sample.id}:`, downloadError);
            }
          }
        }
      } catch (searchError) {
        console.warn(`Failed to search for ${query}:`, searchError);
      }
    }

    return samples;
  }

  async generateEnvironmentAudio(
    environmentId: string,
    duration: number,
    volume: number
  ): Promise<Buffer> {
    const samples = await this.getEnvironmentSamples(environmentId);
    
    if (samples.length === 0) {
      throw new Error(`No samples found for environment: ${environmentId}`);
    }

    // For now, return the first sample
    // In a production app, you'd want to loop/mix the samples to match the duration
    return samples[0];
  }

  private getEnvironmentQueries(environmentId: string): string[] {
    const queryMap: Record<string, string[]> = {
      forest: [
        'forest ambience birds',
        'nature sounds forest',
        'woodland atmosphere',
        'bird song forest',
        'tropical forest'
      ],
      storm: [
        'thunder distant',
        'storm ambience',
        'rain thunder',
        'thunderstorm',
        'lightning thunder'
      ],
      // Add more environments as needed
    };

    return queryMap[environmentId] || [`${environmentId} ambience`];
  }

  async getPreviewUrl(sampleId: number): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/sounds/${sampleId}/`, {
        params: {
          token: this.apiKey
        }
      });

      return response.data.previews['preview-hq-mp3'];
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw new Error('Failed to get preview URL');
    }
  }
}