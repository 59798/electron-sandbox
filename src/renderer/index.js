import 'babel-polyfill';
import { ipcRenderer } from 'electron';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Socket from './Socket';

let address;
let socket;
ipcRenderer.on('server-ready', (event, serverAddress) => {
  address = serverAddress;
});

Vue.use(VueRouter);

const router = new VueRouter;
router.map({
  '/': {
    component: Vue.extend({
      template: `
        <form v-on:submit.prevent="onSubmit">
          <input v-model="session" placeholder="session" autofocus />
          <input v-model="channel" placeholder="channel" />
          <button>view</button>
        </form>
      `,
      route: {
        data: () => ({
          session: localStorage.getItem('session'),
          channel: localStorage.getItem('channel') || 'nsen/hotaru',
        }),
      },
      methods: {
        onSubmit() {
          const { session, channel } = this;
          localStorage.setItem('session', session);
          localStorage.setItem('channel', channel);

          console.log('connecting to', channel, '...');
          socket = new Socket(address.port, session, channel);
          ipcRenderer.send('hide');
        },
      },
    }),
  },
});
router.start(Vue.extend({}), '#main');
