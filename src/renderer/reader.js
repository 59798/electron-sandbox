import Itako from 'itako';
import ItakoAudioReaderAudioContext from 'itako-audio-reader-audio-context';
import ItakoTextTransformerRequest from 'itako-text-transformer-request';
import ItakoTextTransformerDictionary from 'itako-text-transformer-dictionary';

export function createReader() {
  const itako = new Itako([
    new ItakoAudioReaderAudioContext(),
  ], [
    new ItakoTextTransformerDictionary,
    new ItakoTextTransformerRequest('text', {
      baseUrl: 'http://voicetext.berabou.me/',
      toType: 'audio',
      defaults: {
        data: {
          speaker: 'hikari',
          format: 'ogg',
        },
      },
      beforeTransform(token) {
        const opts = {};
        if (token.options.pitch) {
          opts.pitch = Math.floor(token.options.pitch * 100);
          opts.pitch = opts.pitch < 50 ? 50 : opts.pitch;
        }
        if (token.options.volume) {
          opts.volume = Math.floor(token.options.volume * 100);
          opts.volume = opts.volume < 50 ? 50 : opts.volume;
        }
        if (token.options.speed) {
          opts.speed = Math.floor(token.options.speed * 100);
          opts.speed = opts.speed < 50 ? 50 : opts.speed;
        }
        return token.setOptions(opts);
      },
    }),
  ], {
    read: {
      // serial: true,
      preload: true,
    },
    transformers: {
      dictionary: {
        options: [
          {
            pattern: '/play\\((.+?).mp3\\)/',
            method: 'rewrite',
            replacement: "{type:'audio',value:'http://static.edgy.black/sounds/$1.mp3'}",
          },
        ],
      },
    },
  });
  return itako;
}

export default createReader();
