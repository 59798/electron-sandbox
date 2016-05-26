import io from 'socket.io-client';
import notifier from 'node-notifier';
import reader from './reader';

const anonymousId = '900000000';
const nicknames = [];

export default class {
  constructor(port, session, channelId = 'nsen/hotaru', options = { res_from: 5 }) {
    this.socket = io.connect(`ws://localhost:${port}`);
    this.socket.on('connect', () => {
      this.socket.emit('auth', session);
      this.socket.once('authorized', () => {
        console.log('authorized');
        this.socket.emit('view', channelId, options);
      });
    });
    this.socket.on('warn', (error) => {
      console.error(error);
    });
    this.socket.on('getplayerstatus', (getplayerstatus) => {
      this.title = getplayerstatus.title;
      this.icon = getplayerstatus.picture_url;
    });
    this.socket.on('chat', (chat) => {
      this.createNotification(chat);
    });
  }
  fetchNickname(id) {
    return new Promise(resolve => {
      if (nicknames[id]) {
        resolve(nicknames[id]);
        return;
      }

      this.socket.emit('nickname', id, (error, nickname) => {
        if (error) {
          resolve('-');
          return;
        }
        nicknames[id] = nickname;
        resolve(nickname);
      });
    });
  }
  getAvatar(id) {
    let icon = 'http://uni.res.nimg.jp/img/user/thumb/blank.jpg';
    if (id.match(/^\d+$/) && id !== anonymousId) {
      icon = `http://usericon.nimg.jp/usericon/${id.slice(0, id.length - 4)}/${id}.jpg`;
    }
    return icon;
  }
  createNotification(chat) {
    const avatarUri = this.getAvatar(chat.user_id);

    return this.fetchNickname(chat.user_id)
    .then((nickname) => {
      const defaults = {
        icon: this.icon,
        title: this.title,
        message: chat.text,
      };
      const isUserComment = chat.user_id !== anonymousId;
      const notTenHourElapled = new Date(chat.date * 1000) >= Date.now() - 60 * 10 * 1000;
      if (isUserComment && notTenHourElapled) {
        setTimeout(() => {
          reader.read(chat.text);
        }, 50);
        if (nickname === '-') {
          return notifier.notify({ ...defaults, contentImage: avatarUri });
        }

        return notifier.notify({
          ...defaults,
          contentImage: avatarUri,
          subtitle: nickname,
        });
      }
      return notifier.notify(defaults);
    });
  }
}
