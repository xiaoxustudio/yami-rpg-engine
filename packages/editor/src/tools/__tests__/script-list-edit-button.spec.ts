import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { File } from '@app/file/file-system-core.ts';
import { elementDataOf } from '@app/utils/element-data';

describe('ScriptList 编辑按钮（行元素数据回归）', () => {
	let list: HTMLElement;
	let row: HTMLElement;
	let box: HTMLElement;
	let originalGetPath: typeof File.getPath;

	const fire = (target: EventTarget, type: string): void => {
		target.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 }));
	};

	/** `File.getPath` 的签名是 `FileMethod | null`，直接 spyOn 推不出类型，手工换一个记录用替身 */
	const stubGetPath = (): ReturnType<typeof vi.fn> => {
		const getPath = vi.fn(() => 'C:/project/Assets/script-1.js');
		File.getPath = getPath as unknown as typeof File.getPath;
		return getPath;
	};

	beforeEach(() => {
		document.body.innerHTML = '';
		originalGetPath = File.getPath;
		list = document.createElement('div');
		list.className = 'tree-list';
		row = document.createElement('div');
		row.className = 'node-item';
		box = document.createElement('div');
		box.className = 'box script-edit-button';
		row.appendChild(box);
		list.appendChild(row);
		document.body.appendChild(list);
	});

	afterEach(() => {
		File.getPath = originalGetPath;
		document.body.innerHTML = '';
	});

	it('按行元素数据里的 item 打开脚本（不再读元素属性 item）', () => {
		elementDataOf<{ item?: { id: string } }>(row).item = { id: 'script-1' };
		const getPath = stubGetPath();

		new ScriptListInterface().initialize(list as never);
		fire(box, 'pointerdown');
		fire(box, 'pointerup');

		expect(getPath).toHaveBeenCalledWith('script-1');
	});

	it('行上没有脚本项时安全 no-op（不抛错）', () => {
		const getPath = stubGetPath();

		new ScriptListInterface().initialize(list as never);
		expect(() => {
			fire(box, 'pointerdown');
			fire(box, 'pointerup');
		}).not.toThrow();
		expect(getPath).not.toHaveBeenCalled();
	});
});
