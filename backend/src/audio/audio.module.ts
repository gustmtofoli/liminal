import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { SynthesizerService } from './synthesizer.service';
import { FreesoundService } from './freesound.service';

@Module({
  controllers: [AudioController],
  providers: [AudioService, SynthesizerService, FreesoundService],
})
export class AudioModule {}