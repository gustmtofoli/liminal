"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const common_1 = require("@nestjs/common");
const synthesizer_service_1 = require("./synthesizer.service");
const freesound_service_1 = require("./freesound.service");
let AudioService = class AudioService {
    constructor(synthesizerService, freesoundService) {
        this.synthesizerService = synthesizerService;
        this.freesoundService = freesoundService;
    }
    getAvailableEnvironments() {
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
                type: 'freesound',
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
                type: 'hybrid',
                icon: '⚡',
                gradient: 'from-gray-700 to-slate-900'
            }
        ];
    }
    async generateEnvironmentAudio(environmentId, duration, volume) {
        const environment = this.getAvailableEnvironments().find(env => env.id === environmentId);
        if (!environment) {
            throw new Error(`Environment ${environmentId} not found`);
        }
        switch (environment.type) {
            case 'synthesized':
                return this.synthesizerService.generateEnvironmentAudio(environmentId, duration, volume);
            case 'freesound':
                return this.freesoundService.generateEnvironmentAudio(environmentId, duration, volume);
            case 'hybrid':
                // Combine synthesized base with freesound samples
                const synth = await this.synthesizerService.generateEnvironmentAudio(environmentId, duration, volume);
                const samples = await this.freesoundService.getEnvironmentSamples(environmentId);
                return this.mixAudioSources(synth, samples, volume);
            default:
                throw new Error(`Unknown environment type: ${environment.type}`);
        }
    }
    async streamEnvironmentAudio(environmentId, options, res) {
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
            const audioChunk = await this.generateEnvironmentAudio(environmentId, chunkDuration, options.volume || 0.7);
            res.write(audioChunk);
            // Add small delay to simulate real-time streaming
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        res.end();
    }
    async searchFreesoundSamples(query) {
        return this.freesoundService.searchSamples(query);
    }
    async mixAudioSources(synthesized, samples, volume) {
        // Simple audio mixing logic - in production, use a proper audio library
        // For now, return the synthesized audio
        return synthesized;
    }
};
exports.AudioService = AudioService;
exports.AudioService = AudioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [synthesizer_service_1.SynthesizerService,
        freesound_service_1.FreesoundService])
], AudioService);
