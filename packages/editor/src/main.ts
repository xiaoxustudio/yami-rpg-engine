import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '@/browser/browser-bridge.ts';

const app = createApp(App);
app.use(createPinia());

const el = document.getElementById('app');
if (el) {
	app.mount(el);
	import('@/main/module-init').then(() => {
		window.dispatchEvent(new Event('vue-app-mounted'));
	});
}
