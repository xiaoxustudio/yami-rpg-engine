import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Font from '@app/components/tools/Font.vue';
import FontSize from '@app/components/tools/FontSize.vue';
import TextPosition from '@app/components/tools/TextPosition.vue';
import TextEffect from '@app/components/tools/TextEffect.vue';
import InsertImage from '@app/components/tools/InsertImage.vue';
import LocalVariable from '@app/components/tools/LocalVariable.vue';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const mountAll = async (): Promise<ReturnType<typeof mount>[]> => {
	const wrappers = [
		mount(Font, { attachTo: document.body }),
		mount(FontSize, { attachTo: document.body }),
		mount(TextPosition, { attachTo: document.body }),
		mount(TextEffect, { attachTo: document.body }),
		mount(InsertImage, { attachTo: document.body }),
		mount(LocalVariable, { attachTo: document.body })
	];
	await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
	return wrappers;
};

describe('useTextCaptureWindow（文字捕获窗口 composable：六个标签窗口 open/confirm）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('font open 填充表单，confirm 回调表单并关闭窗口', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.font.open('Arial', callback);
		expect(Window.open).toHaveBeenCalledWith('font');
		expect(capture.font.form.font).toBe('Arial');
		expect(getFrame('font').getForm().font).toBe('Arial');
		getFrame('font').setForm({ font: 'Georgia' });
		capture.font.confirm();
		expect(callback).toHaveBeenCalledWith({ font: 'Georgia' });
		expect(Window.close).toHaveBeenCalledWith('font');
		wrappers.forEach((w) => w.unmount());
	});

	it('font confirm 空字体时不关闭窗口、不触发回调', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.font.open('', callback);
		capture.font.confirm();
		expect(callback).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrappers.forEach((w) => w.unmount());
	});

	it('fontSize open/confirm 表单往返', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.fontSize.open(12, callback);
		expect(Window.open).toHaveBeenCalledWith('fontSize');
		expect(getFrame('fontSize').getForm().size).toBe(12);
		getFrame('fontSize').setForm({ size: 24 });
		capture.fontSize.confirm();
		expect(callback).toHaveBeenCalledWith({ size: 24 });
		expect(Window.close).toHaveBeenCalledWith('fontSize');
		wrappers.forEach((w) => w.unmount());
	});

	it('textPosition open/confirm 表单往返', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.textPosition.open({ axis: 'x', operation: 'set', value: 8 }, callback);
		expect(Window.open).toHaveBeenCalledWith('textPosition');
		expect(getFrame('textPosition').getForm()).toEqual({
			axis: 'x',
			operation: 'set',
			value: 8
		});
		getControl('textPosition-operation').write('add');
		getControl('textPosition-value').write(15);
		capture.textPosition.confirm();
		expect(callback).toHaveBeenCalledWith({ axis: 'x', operation: 'add', value: 15 });
		expect(Window.close).toHaveBeenCalledWith('textPosition');
		wrappers.forEach((w) => w.unmount());
	});

	it('textEffect open/confirm 表单往返', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.textEffect.open(
			{
				type: 'shadow',
				shadowOffsetX: 1,
				shadowOffsetY: 2,
				strokeWidth: 1,
				color: '000000ff'
			},
			callback
		);
		expect(Window.open).toHaveBeenCalledWith('textEffect');
		getControl('textEffect-type').write('stroke');
		getControl('textEffect-strokeWidth').write(4);
		getControl('textEffect-color').write('ff0000ff');
		capture.textEffect.confirm();
		expect(callback).toHaveBeenCalledWith({
			type: 'stroke',
			shadowOffsetX: 1,
			shadowOffsetY: 2,
			strokeWidth: 4,
			color: 'ff0000ff'
		});
		expect(Window.close).toHaveBeenCalledWith('textEffect');
		wrappers.forEach((w) => w.unmount());
	});

	it('image open/confirm 表单往返', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.image.open(
			{ mode: 'image', image: 'pic.png', clip: [0, 0, 64, 64], width: 64, height: 64 },
			callback
		);
		expect(Window.open).toHaveBeenCalledWith('insertImage');
		expect(getFrame('insertImage').getForm().image).toBe('pic.png');
		getControl('insertImage-mode').write('image-size');
		getControl('insertImage-width').write(32);
		getControl('insertImage-height').write(16);
		capture.image.confirm();
		expect(callback).toHaveBeenCalledWith({
			mode: 'image-size',
			image: 'pic.png',
			clip: [0, 0, 64, 64],
			width: 32,
			height: 16
		});
		expect(Window.close).toHaveBeenCalledWith('insertImage');
		wrappers.forEach((w) => w.unmount());
	});

	it('image confirm 空图片时不关闭窗口、不触发回调', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.image.open(
			{ mode: 'image', image: '', clip: [0, 0, 64, 64], width: 64, height: 64 },
			callback
		);
		capture.image.confirm();
		expect(callback).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrappers.forEach((w) => w.unmount());
	});

	it('localVariable open/confirm 表单往返', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.localVariable.open('hp', callback);
		expect(Window.open).toHaveBeenCalledWith('localVariable');
		expect(getControl('localVariable-key').read()).toBe('hp');
		getControl('localVariable-key').write('mp');
		capture.localVariable.confirm();
		expect(callback).toHaveBeenCalledWith({ key: 'mp' });
		expect(Window.close).toHaveBeenCalledWith('localVariable');
		wrappers.forEach((w) => w.unmount());
	});

	it('localVariable confirm 空 key 时不关闭窗口、不触发回调', async () => {
		const wrappers = await mountAll();
		const capture = useTextCaptureWindow();
		const callback = vi.fn();
		capture.localVariable.open('', callback);
		capture.localVariable.confirm();
		expect(callback).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrappers.forEach((w) => w.unmount());
	});

	it('legacy Selection 控制器 open/confirm 转发 composable 并执行 wrap', async () => {
		const { Selection } = await import('@app/tools/text-capture.ts');
		const wrappers = await mountAll();
		const insert = vi.fn();
		const parent = document.createElement('div');
		(parent as HTMLElement & { insert(value: unknown): void }).insert = insert;
		const input = document.createElement('input');
		input.value = 'x';
		parent.appendChild(input);
		Selection.target = input as never;
		Selection.inserting = false;
		Selection.font.open!({ font: 'Arial' });
		expect(Window.open).toHaveBeenCalledWith('font');
		expect(getFrame('font').getForm().font).toBe('Arial');
		getFrame('font').setForm({ font: 'Georgia' });
		Selection.font.confirm!({} as Event);
		expect(insert).toHaveBeenCalledWith('<font:Georgia>');
		expect(Window.close).toHaveBeenCalledWith('font');
		wrappers.forEach((w) => w.unmount());
	});
});
