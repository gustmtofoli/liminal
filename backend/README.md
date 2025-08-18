# Liminal Audio Backend

Backend NestJS com TypeScript para geração programática de ambientes sonoros relaxantes.

## 🚀 Funcionalidades

- **Síntese de Áudio**: Geração programática de sons usando algoritmos de síntese
- **Integração Freesound**: Busca e uso de samples do Freesound.org
- **Streaming em Tempo Real**: Transmissão de áudio em chunks
- **Múltiplos Ambientes**: 8 ambientes sonoros diferentes
- **API RESTful**: Endpoints para controle completo dos áudios

## 🎵 Ambientes Disponíveis

| ID | Nome | Tipo | Tecnologia |
|----|------|------|------------|
| `rain` | Chuva Suave | Sintético | Noise generator + Filter |
| `ocean` | Oceano Calmo | Sintético | Oscillators + LFO |
| `fire` | Fogueira Noturna | Sintético | Envelope generator |
| `wind` | Vento Suave | Sintético | Filtered noise |
| `frequency` | Frequência 432Hz | Sintético | Pure tone |
| `cafe` | Café Urbano | Sintético | Multi-layer noise |
| `forest` | Floresta Tropical | Freesound | Samples externos |
| `storm` | Tempestade Distante | Híbrido | Sintético + Samples |

## 🛠 Instalação

```bash
# Clone o repositório
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com sua chave do Freesound.org

# Inicie o servidor de desenvolvimento
npm run start:dev
```

## 📡 API Endpoints

### GET /health
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-17T21:21:01.960Z",
  "service": "Liminal Audio Backend"
}
```

### GET /audio/environments
Lista todos os ambientes sonoros disponíveis.

**Resposta:**
```json
[
  {
    "id": "rain",
    "name": "Chuva Suave",
    "description": "Som relaxante de chuva leve caindo",
    "type": "synthesized",
    "icon": "🌧️",
    "gradient": "from-blue-600 to-indigo-800"
  }
]
```

### GET /audio/generate/:environmentId
Gera áudio para um ambiente específico.

**Parâmetros de Query:**
- `duration` (opcional): Duração em segundos (padrão: 30)
- `volume` (opcional): Volume de 0.0 a 1.0 (padrão: 0.7)

**Exemplo:**
```bash
curl "http://localhost:3001/audio/generate/rain?duration=60&volume=0.5"
```

### POST /audio/stream/:environmentId
Streaming de áudio em tempo real.

**Body:**
```json
{
  "duration": 300000,
  "volume": 0.7
}
```

### GET /audio/search
Busca samples no Freesound.org.

**Parâmetros de Query:**
- `query`: Termo de busca

**Exemplo:**
```bash
curl "http://localhost:3001/audio/search?query=forest+birds"
```

## 🎚 Tecnologias de Síntese

### Chuva (Rain)
- **Noise Generator**: Pink noise filtrado
- **Filter**: Lowpass 8kHz
- **Reverb**: Simula espaço acústico
- **Dinâmica**: Volume controlado por envelope

### Oceano (Ocean)
- **Oscillators**: Dual sine waves (60Hz, 90Hz)
- **LFO**: Modulação lenta (0.1Hz) para ondas
- **Filter**: Lowpass 400Hz
- **Reverb**: Longo para simular espaço aberto

### Fogueira (Fire)
- **Noise Generator**: Brown noise
- **Envelope**: Attack/Release randômico para estalos
- **Filter**: Lowpass 2kHz
- **Trigger**: Estalos aleatórios a cada 0.5-1.5s

### Vento (Wind)
- **Noise Generator**: White noise
- **Filter**: Highpass 1kHz com modulação LFO
- **LFO**: 0.05Hz para rajadas
- **Dinâmica**: Volume baixo e suave

### Frequência 432Hz
- **Oscillator**: Sine wave pura em 432Hz
- **Envelope**: Sustain contínuo
- **Volume**: Baixo para meditação

### Café (Cafe)
- **Background**: Pink noise filtrado (500Hz lowpass)
- **Conversation**: Brown noise filtrado (1.5kHz bandpass)
- **Mix**: Layers sobrepostas com volumes diferentes

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Freesound.org API Key
FREESOUND_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Freesound.org Setup

1. Acesse [Freesound.org](https://freesound.org/help/developers/)
2. Crie uma conta e registre uma aplicação
3. Copie sua API key para o arquivo `.env`

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start

# Debug
npm run start:debug
```

## 🏗 Arquitetura

```
src/
├── main.ts              # Entry point
├── app.module.ts        # Módulo principal
├── app.controller.ts    # Controller principal
├── app.service.ts       # Service principal
└── audio/
    ├── audio.module.ts      # Módulo de áudio
    ├── audio.controller.ts  # Endpoints da API
    ├── audio.service.ts     # Lógica principal
    ├── synthesizer.service.ts # Síntese de áudio
    └── freesound.service.ts   # Integração Freesound
```

## 🎯 Próximos Passos

1. **Implementar síntese real**: Atualmente retorna buffers de teste
2. **Web Audio API Server-Side**: Usar bibliotecas como `web-audio-api` para Node.js
3. **Cache de áudio**: Implementar cache para samples frequentes
4. **Compressão**: Adicionar compressão de áudio
5. **WebSocket**: Streaming real-time via WebSocket
6. **Análise espectral**: Visualizações de frequência
7. **AI-Generated**: Usar IA para gerar variações

## 📝 Notas Técnicas

- **Tone.js**: Biblioteca de síntese, mas é ES module (desafio no Node.js)
- **Audio Context**: Requer ambiente browser-like
- **Streaming**: Implementado com chunks de 5 segundos
- **CORS**: Configurado para frontend em localhost:3000