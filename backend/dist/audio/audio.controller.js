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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
const common_1 = require("@nestjs/common");
const audio_service_1 = require("./audio.service");
let AudioController = class AudioController {
    constructor(audioService) {
        this.audioService = audioService;
    }
    getAvailableEnvironments() {
        return this.audioService.getAvailableEnvironments();
    }
    async generateAudio(environmentId, duration, volume, res) {
        const durationMs = duration ? parseInt(duration) * 1000 : 30000; // Default 30s
        const volumeLevel = volume ? parseFloat(volume) : 0.7; // Default 70%
        const audioData = await this.audioService.generateEnvironmentAudio(environmentId, durationMs, volumeLevel);
        if (res) {
            res.set({
                'Content-Type': 'audio/wav',
                'Content-Length': audioData.length.toString(),
                'Cache-Control': 'public, max-age=3600'
            });
            res.send(audioData);
        }
        return audioData;
    }
    async streamAudio(environmentId, options, res) {
        // For real-time streaming
        res.writeHead(200, {
            'Content-Type': 'audio/wav',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache'
        });
        await this.audioService.streamEnvironmentAudio(environmentId, options, res);
    }
    async searchFreesound(query) {
        return this.audioService.searchFreesoundSamples(query);
    }
};
exports.AudioController = AudioController;
__decorate([
    (0, common_1.Get)('environments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AudioController.prototype, "getAvailableEnvironments", null);
__decorate([
    (0, common_1.Get)('generate/:environmentId'),
    __param(0, (0, common_1.Param)('environmentId')),
    __param(1, (0, common_1.Query)('duration')),
    __param(2, (0, common_1.Query)('volume')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "generateAudio", null);
__decorate([
    (0, common_1.Post)('stream/:environmentId'),
    __param(0, (0, common_1.Param)('environmentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "streamAudio", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "searchFreesound", null);
exports.AudioController = AudioController = __decorate([
    (0, common_1.Controller)('audio'),
    __metadata("design:paramtypes", [audio_service_1.AudioService])
], AudioController);
