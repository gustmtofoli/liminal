"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreesoundService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let FreesoundService = class FreesoundService {
    constructor() {
        this.baseUrl = 'https://freesound.org/apiv2';
        this.apiKey = process.env.FREESOUND_API_KEY || 'YOUR_API_KEY_HERE';
    }
    async searchSamples(query, page = 1, pageSize = 20) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/search/text/`, {
                params: {
                    query,
                    page,
                    page_size: pageSize,
                    fields: 'id,name,description,download,previews,duration,tags',
                    token: this.apiKey
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error searching Freesound:', error);
            throw new Error('Failed to search Freesound samples');
        }
    }
    async downloadSample(sampleId) {
        try {
            // First get the sample details
            const sampleResponse = await axios_1.default.get(`${this.baseUrl}/sounds/${sampleId}/`, {
                params: {
                    token: this.apiKey
                }
            });
            const downloadUrl = sampleResponse.data.download;
            // Download the audio file
            const audioResponse = await axios_1.default.get(downloadUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'Authorization': `Token ${this.apiKey}`
                }
            });
            return Buffer.from(audioResponse.data);
        }
        catch (error) {
            console.error('Error downloading sample:', error);
            throw new Error('Failed to download sample');
        }
    }
    async getEnvironmentSamples(environmentId) {
        const queries = this.getEnvironmentQueries(environmentId);
        const samples = [];
        for (const query of queries) {
            try {
                const searchResult = await this.searchSamples(query, 1, 5);
                if (searchResult.results.length > 0) {
                    // Download the first few samples
                    for (const sample of searchResult.results.slice(0, 2)) {
                        try {
                            const audioBuffer = await this.downloadSample(sample.id);
                            samples.push(audioBuffer);
                        }
                        catch (downloadError) {
                            console.warn(`Failed to download sample ${sample.id}:`, downloadError);
                        }
                    }
                }
            }
            catch (searchError) {
                console.warn(`Failed to search for ${query}:`, searchError);
            }
        }
        return samples;
    }
    async generateEnvironmentAudio(environmentId, duration, volume) {
        const samples = await this.getEnvironmentSamples(environmentId);
        if (samples.length === 0) {
            throw new Error(`No samples found for environment: ${environmentId}`);
        }
        // For now, return the first sample
        // In a production app, you'd want to loop/mix the samples to match the duration
        return samples[0];
    }
    getEnvironmentQueries(environmentId) {
        const queryMap = {
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
    async getPreviewUrl(sampleId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/sounds/${sampleId}/`, {
                params: {
                    token: this.apiKey
                }
            });
            return response.data.previews['preview-hq-mp3'];
        }
        catch (error) {
            console.error('Error getting preview URL:', error);
            throw new Error('Failed to get preview URL');
        }
    }
};
exports.FreesoundService = FreesoundService;
exports.FreesoundService = FreesoundService = __decorate([
    (0, common_1.Injectable)()
], FreesoundService);
