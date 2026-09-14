import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from '@app/stores/pinia';
import { initYamiI18n } from '@app/i18n';
import { vFocus } from '@app/directives/focus';
import { vTip } from '@app/directives/tip';
import '@app/utils/element-data.ts';
import '@app/main/startup.ts';
import { emitCustom } from '@app/events/custom-events';

window.addEventListener('error', (e: ErrorEvent) => {
	if (e.message === 'ResizeObserver loop limit exceeded') {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
});

const app = createApp(App);
app.use(pinia);
app.use(initYamiI18n({ autoLoad: true }));
app.directive('focus', vFocus);
app.directive('tip', vTip);

const el = document.getElementById('app');
if (el) {
	app.mount(el);
	emitCustom('vue-app-mounted');
}
