import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from '@app/stores/pinia';

const app = createApp(App);
app.use(pinia);

const el = document.getElementById('app');
if (el) {
	app.mount(el);
	import('@/main/module-init').then(() => {
		window.dispatchEvent(new Event('vue-app-mounted'));
	});
}
