import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Resource from '@app/components/tools/Resource.vue';
import { getResourceStore, type ResourceRow } from '@app/stores/resource';
import { initYamiI18n } from '@app/i18n';

/**
 * R1（资源列表数据化）后的契约：
 * - 行由 `stores/resource.ts` 驱动、`resource/ResourceList.vue` v-for 渲染（不再有 update 桥接）；
 * - 行内交互以事件上抛到 `Resources.download/pause/remove`；
 * - 按钮文案来自 i18n（不再是模块上的 checkVersionText/openDirText 字段）。
 */
const resources = vi.hoisted(() => ({
	download: vi.fn(),
	pause: vi.fn(),
	remove: vi.fn(),
	checkVersion: vi.fn(),
	openDir: vi.fn()
}));

vi.mock('@app/module/resource', () => ({
	Resources: resources
}));

const makeRow = (patch: Partial<ResourceRow> = {}): ResourceRow => ({
	key: 'arpg-ts-english',
	value: 'arpg-ts-english',
	version: '',
	installed: false,
	hasTemp: false,
	sizeText: '大小: 12.3 MB',
	speedText: '速度: 0 KB/s',
	progress: 0,
	phase: 'idle',
	...patch
});

describe('Resource（资源窗口：列表数据化 + 按钮交互）', () => {
	beforeEach(() => {
		getResourceStore().reset();
		resources.download.mockClear();
		resources.pause.mockClear();
		resources.remove.mockClear();
		resources.checkVersion.mockClear();
		resources.openDir.mockClear();
	});

	const mountPage = async () => {
		const wrapper = mount(Resource, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('行由 store 渲染：数量、id 约定、版本/大小文案跟数据走', async () => {
		const store = getResourceStore();
		store.setRows([
			makeRow({ installed: true, hasTemp: true, version: 'v1.2.3' }),
			makeRow({ key: 'arpg-ts-chinese', value: 'arpg-ts-chinese' })
		]);
		const wrapper = await mountPage();

		expect(document.querySelectorAll('.resource-item')).toHaveLength(2);
		const first = document.getElementById('resource-item-arpg-ts-english');
		expect(first).toBeTruthy();
		const input = first?.querySelector('input') as HTMLInputElement;
		expect(input.value).toBe('v1.2.3');
		expect(input.readOnly).toBe(true);
		expect(first?.querySelector('#resource-item-arpg-ts-english-size')?.textContent).toContain(
			'12.3 MB'
		);

		// 已安装：下载按钮带 disabled 类、删除按钮可用
		const download = document.getElementById('resource-item-arpg-ts-english-download');
		expect(download?.classList.contains('disabled')).toBe(true);
		const del = document.getElementById('resource-item-arpg-ts-english-delete');
		expect(del?.classList.contains('disabled')).toBe(false);

		// 未安装且无模板目录：删除按钮禁用
		const del2 = document.getElementById('resource-item-arpg-ts-chinese-delete');
		expect(del2?.classList.contains('disabled')).toBe(true);

		wrapper.unmount();
	});

	it('下载中：显示暂停与进度，按钮文案切到解压态；点击分别上抛到模块', async () => {
		const store = getResourceStore();
		store.setRows([
			makeRow({ phase: 'downloading', progress: 42, speedText: '速度: 1.5 MB/s' })
		]);
		const wrapper = await mountPage();

		const pause = document.getElementById('resource-item-arpg-ts-english-pause') as HTMLElement;
		expect(pause.style.display).not.toBe('none');
		const progress = document.getElementById(
			'resource-item-arpg-ts-english-progress'
		) as HTMLElement;
		expect(progress.style.display).not.toBe('none');
		expect(
			document
				.getElementById('resource-item-arpg-ts-english-progress-text')
				?.textContent?.trim()
		).toBe('42%');
		expect(
			document.getElementById('resource-item-arpg-ts-english-speed')?.textContent
		).toContain('1.5 MB/s');

		await wrapper.find('#resource-item-arpg-ts-english-download').trigger('click');
		await wrapper.find('#resource-item-arpg-ts-english-pause').trigger('click');
		await wrapper.find('#resource-item-arpg-ts-english-delete').trigger('click');
		expect(resources.download).toHaveBeenCalledWith('arpg-ts-english');
		expect(resources.pause).toHaveBeenCalledWith('arpg-ts-english');
		expect(resources.remove).toHaveBeenCalledWith('arpg-ts-english');

		// 解压态：下载按钮文案切换、进度条仍在
		store.patchRow('arpg-ts-english', { phase: 'decompressing', progress: 80 });
		await wrapper.vm.$nextTick();
		expect(
			document.getElementById('resource-item-arpg-ts-english-download')?.textContent?.trim()
		).not.toBe('');
		expect(pause.style.display).toBe('none');

		wrapper.unmount();
	});

	it('idle 时进度区隐藏；节点信息来自 store', async () => {
		const store = getResourceStore();
		store.setRows([makeRow()]);
		store.setNodeText('当前节点: 自动选择');
		store.setPing('Ping: 128ms', '#4caf50');
		const wrapper = await mountPage();

		const progress = document.getElementById(
			'resource-item-arpg-ts-english-progress'
		) as HTMLElement;
		expect(progress.style.display).toBe('none');
		expect(document.getElementById('resource-current-node')?.textContent).toContain(
			'当前节点: 自动选择'
		);
		const ping = document.getElementById('resource-node-ping') as HTMLElement;
		expect(ping.textContent).toContain('Ping: 128ms');
		expect(ping.style.color).toBe('rgb(76, 175, 80)');

		wrapper.unmount();
	});

	it('底部两个按钮上抛到模块（不再是模块写 DOM 文本）', async () => {
		const wrapper = await mountPage();
		await wrapper.find('#resource-check-version').trigger('click');
		await wrapper.find('#resource-open-dir').trigger('click');
		expect(resources.checkVersion).toHaveBeenCalledTimes(1);
		expect(resources.openDir).toHaveBeenCalledTimes(1);
		// 文案来自 i18n：非空即说明有翻译键命中
		expect(
			document.getElementById('resource-check-version')?.textContent?.trim().length
		).toBeGreaterThan(0);
		wrapper.unmount();
	});
});
