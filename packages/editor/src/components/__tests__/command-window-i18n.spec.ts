import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import DownloadFile from '@app/components/commands/DownloadFile.vue';
import HttpRequest from '@app/components/commands/HttpRequest.vue';
import RequestURL from '@app/components/commands/RequestURL.vue';
import UploadFile from '@app/components/commands/UploadFile.vue';
import WebSocketConnect from '@app/components/commands/WebSocketConnect.vue';
import { applyLocaleData, getYamiI18n, initYamiI18n } from '@app/i18n';
import type { LocaleData } from '@app/i18n/convert';

/**
 * 语言加载后命令窗口仍能渲染（回归：`t()` 编译报错炸掉 render）。
 *
 * 现象：窗口先挂载、语言后加载（`applyLocaleData` 切 locale → 全量重渲染），
 * 此时文案里的 `@`（`@code` / `@event`）与字面量花括号被 vue-i18n 当语法，
 * `t()` 直接抛 Message compilation error，Vue 报
 * `Unhandled error during execution of render function`，downloadFile / uploadFile /
 * requestURL / httpRequest / webSocketConnect 这些窗口全灭。
 */
const LOCALE_DIR = resolve(process.cwd(), 'Project/Locales');

const loadLocale = (file: string): LocaleData =>
	JSON.parse(readFileSync(resolve(LOCALE_DIR, file), 'utf8')) as LocaleData;

const windows = {
	downloadFile: { component: DownloadFile, title: 'Download File' },
	uploadFile: { component: UploadFile, title: 'Upload File' },
	requestURL: { component: RequestURL, title: 'Request URL' },
	httpRequest: { component: HttpRequest, title: 'HTTP Request' },
	webSocketConnect: { component: WebSocketConnect, title: 'WebSocket Connect' }
} as const;

describe('命令窗口在语言加载后可渲染（@ / {} 字面量回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		initYamiI18n();
		applyLocaleData('en-US', loadLocale('en-US.English.json'));
	});

	for (const [id, { component, title }] of Object.entries(windows)) {
		it(`${id}：首屏渲染出标题与控件`, () => {
			expect(() => mount(component, { attachTo: document.body })).not.toThrow();
			const frame = document.getElementById(id);
			expect(frame).toBeTruthy();
			expect(frame?.textContent).toContain(title);
		});
	}

	it('切换语言（重渲染）不抛错，且文案里的 @ 保留', async () => {
		const wrapper: VueWrapper = mount(HttpRequest, { attachTo: document.body });
		applyLocaleData('zh-CN', loadLocale('zh-CN.简体中文.json'));
		await wrapper.vm.$nextTick();
		const t = getYamiI18n().global.t;
		expect(getYamiI18n().global.locale.value).toBe('zh-CN');
		const title = t('components.httpRequest.title');
		expect(title).not.toBe('components.httpRequest.title');
		expect(document.getElementById('httpRequest')?.textContent).toContain(title);
		expect(t('components.httpRequest-callback.tip')).toContain('@code');
		wrapper.unmount();
	});
});
