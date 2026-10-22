import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from '@app/stores/pinia';
import { initYamiI18n } from '@app/i18n';
import { vFocus } from '@app/directives/focus';
import { vTip } from '@app/directives/tip';
import '@app/main/startup.ts';
import { emitCustom, onCustom } from '@app/events/custom-events';
import { markBoot } from '@app/utils/boot-timeline';

markBoot('main-body');

const BOOT_SPLASH_TIMEOUT = 15000;

const appContainer = document.getElementById('app');

const bootSplashTimer = window.setTimeout(() => {
	dismissBootSplash('timeout');
}, BOOT_SPLASH_TIMEOUT);

function dismissBootSplash(reason: 'home' | 'failed' | 'timeout'): void {
	window.clearTimeout(bootSplashTimer);
	const splash = appContainer?.firstElementChild;
	if (!splash || splash.id !== 'yami-boot') return;
	splash.remove();
	if (reason !== 'home') console.warn(`[boot] 加载层由非正常路径移除：${reason}`);
}

onCustom('boot-ready', (payload) => dismissBootSplash(payload.ok ? 'home' : 'failed'));

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

if (appContainer) {
	app.mount(appContainer);
	markBoot('vue-mounted');
	emitCustom('vue-app-mounted');
}
