import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileAudioPage } from '@app/composables/useFileAudioPage';

interface AudioInfo {
	name: string;
	size: string;
	duration: string;
	bitrate: string;
}

interface AudioParams {
	volume: number;
	pan: number;
	dry: number;
	wet: number;
}

const fileAudio = vi.hoisted(() => ({
	info: null as AudioInfo | null,
	params: null as AudioParams | null,
	updateParams: vi.fn(),
	updateParamInfos: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileAudio
	}
}));

const Host = defineComponent({
	setup() {
		return useFileAudioPage();
	},
	render: () => null
});

const makeInfo = (overrides: Partial<AudioInfo> = {}): AudioInfo => ({
	name: 'bgm.mp3',
	size: '1.2 MB',
	duration: '3:45',
	bitrate: '128Kbps',
	...overrides
});

const makeParams = (overrides: Partial<AudioParams> = {}): AudioParams => ({
	volume: 0.8,
	pan: 0.2,
	dry: 0.5,
	wet: 0.3,
	...overrides
});

describe('useFileAudioPage（fileAudio inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileAudio.info = null;
		fileAudio.params = null;
		fileAudio.updateParams.mockClear();
		fileAudio.updateParamInfos.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileAudioPage>
		};
	};

	it('sync 从 Inspector.fileAudio.info/params 填充 form', () => {
		const { wrapper, page } = mountPage();
		fileAudio.info = makeInfo();
		fileAudio.params = makeParams();
		page.sync();
		expect(page.form.name).toBe('bgm.mp3');
		expect(page.form.size).toBe('1.2 MB');
		expect(page.form.duration).toBe('3:45');
		expect(page.form.bitrate).toBe('128Kbps');
		expect(page.form.volume).toBe(0.8);
		expect(page.form.pan).toBe(0.2);
		expect(page.form.dry).toBe(0.5);
		expect(page.form.wet).toBe(0.3);
		wrapper.unmount();
	});

	it('info/params 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileAudio.info = makeInfo();
		fileAudio.params = makeParams();
		page.sync();
		fileAudio.info = null;
		fileAudio.params = null;
		page.sync();
		expect(page.form.name).toBe('bgm.mp3');
		expect(page.form.volume).toBe(0.8);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileAudio 控件时跳过 updateParams', () => {
		const { wrapper, page } = mountPage();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileAudio.updateParams).not.toHaveBeenCalled();
		expect(fileAudio.updateParamInfos).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并以 form 值调用 updateParams + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileAudio.params = makeParams({ volume: 0.1 });
		page.sync();
		fileAudio.params = makeParams({ volume: 0.9 });
		page.form.volume = 0.4;
		const el = document.createElement('div');
		el.id = 'fileAudio-volume';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileAudio.updateParams).toHaveBeenCalledWith({
			volume: 0.4,
			pan: 0.2,
			dry: 0.5,
			wet: 0.3
		});
		expect(fileAudio.updateParamInfos).toHaveBeenCalled();
		expect(page.form.volume).toBe(0.9);
		wrapper.unmount();
	});
});
