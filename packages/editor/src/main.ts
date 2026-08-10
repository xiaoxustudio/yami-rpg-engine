import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from '@app/stores/pinia';
import '@app/utils/element-data.ts';

window.addEventListener('error', (e: ErrorEvent) => {
	if (e.message === 'ResizeObserver loop limit exceeded') {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
});

const app = createApp(App);
app.use(pinia);

const el = document.getElementById('app');
if (el) {
	app.mount(el);
	void import('@/main/module-init').then(() => {
		window.dispatchEvent(new Event('vue-app-mounted'));
	});
}
