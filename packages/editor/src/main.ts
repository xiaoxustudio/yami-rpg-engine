import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from '@app/stores/pinia';
import { initYamiI18n } from '@app/i18n';
import { vFocus } from '@app/directives/focus';
import { vTip } from '@app/directives/tip';
import '@app/main/startup.ts';
import { emitCustom } from '@app/events/custom-events';

window.addEventListener('error', (e: ErrorEvent) => {
	if (e.message === 'ResizeObserver loop limit exceeded') {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
});

// 顺序说明（pinia 迁移收尾时复核过，结论：**无需调整顺序**）：
// 上面 import 的 `@app/main/startup.ts` 里那些注册是**模块求值期**副作用，而本仓取 store 一律走
// `getXStore()` —— 它用的是 `@app/stores/pinia` 里的**模块级** pinia 实例，该实例在 import 时
// 就已创建 ⇒ 与下面 `app.use(pinia)` 的先后无关。
// 分析阶段担心的「无参 `useXStore()` 必须等 `app.use(pinia)`」那类调用点，已在迁移中清零
// （服务模块 17 处 + 组件层 8 处）。保留 `app.use(pinia)` 是给 DevTools 与模板内 `useXStore()` 用。
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
