import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FileAudioPage from '@app/components/inspector/FileAudioPage.vue';

interface FileAudioInfo {
	name: string;
	size: string;
	duration: string;
	bitrate: string;
}

interface FileAudioParams {
	volume: number;
	pan: number;
	dry: number;
	wet: number;
}

const fileAudio = vi.hoisted(() => ({
	info: null as FileAudioInfo | null,
	params: null as FileAudioParams | null,
	paramInput: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: { fileAudio }
}));

vi.mock('@app/stores/audio', () => ({
	useAudioStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

type UpdateEl = HTMLElement & { update?: () => void };

describe('FileAudioPage（文件音频信息响应式渲染桥接）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileAudio.info = null;
		fileAudio.params = null;
		fileAudio.paramInput.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'fileAudio';
		document.body.appendChild(host);
		const wrapper = mount(FileAudioPage, {
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted 挂载 update 桥接并渲染默认值', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('fileAudio') as UpdateEl;
		expect(typeof el.update).toBe('function');
		expect(document.getElementById('fileAudio-name')?.textContent).toBe('');
		expect(document.getElementById('fileAudio-size')?.textContent).toBe('');
		expect(document.getElementById('fileAudio-duration')?.textContent).toBe('');
		expect(document.getElementById('fileAudio-bitrate')?.textContent).toBe('');
		expect(document.getElementById('fileAudio-volume-info')?.textContent).toBe('100%');
		expect(document.getElementById('fileAudio-pan-info')?.textContent).toBe('0%');
		expect(document.getElementById('fileAudio-dry-info')?.textContent).toBe('100%');
		expect(document.getElementById('fileAudio-wet-info')?.textContent).toBe('0%');
		wrapper.unmount();
	});

	it('update 桥接响应式渲染 legacy 信息与混音参数', async () => {
		const wrapper = await mountPage();
		fileAudio.info = {
			name: 'bgm.mp3',
			size: '1.5 MB',
			duration: '2:05',
			bitrate: '128Kbps'
		};
		fileAudio.params = { volume: 0.5, pan: -0.5, dry: 0.8, wet: 0.2 };
		(document.getElementById('fileAudio') as UpdateEl).update?.();
		await wrapper.vm.$nextTick();
		expect(document.getElementById('fileAudio-name')?.textContent).toBe('bgm.mp3');
		expect(document.getElementById('fileAudio-size')?.textContent).toBe('1.5 MB');
		expect(document.getElementById('fileAudio-duration')?.textContent).toBe('2:05');
		expect(document.getElementById('fileAudio-bitrate')?.textContent).toBe('128Kbps');
		expect(document.getElementById('fileAudio-volume-info')?.textContent).toBe('50%');
		expect(document.getElementById('fileAudio-pan-info')?.textContent).toBe('-50%');
		expect(document.getElementById('fileAudio-dry-info')?.textContent).toBe('80%');
		expect(document.getElementById('fileAudio-wet-info')?.textContent).toBe('20%');
		wrapper.unmount();
	});
});
