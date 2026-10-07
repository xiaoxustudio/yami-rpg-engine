import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';

describe('useInspectorInput.bindInput 的 editor/owner 实参契约', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('第 3 个实参作为 owner 透传给 Inspector.inputBlur，且它带 history', () => {
		const captured: unknown[][] = [];
		Inspector.inputBlur = ((...args: unknown[]) => {
			captured.push(args);
			return () => undefined;
		}) as unknown as typeof Inspector.inputBlur;

		const history = { save: vi.fn() };
		const uiOwner = { target: { id: 'animation' }, history };
		const pageEditor = { target: { id: 'animation' }, onParamInput: vi.fn() };
		const elements = [document.createElement('input')];

		useInspectorInput().bindInput(elements, pageEditor as never, uiOwner as never);

		expect(captured).toHaveLength(1);
		const [editorArg, ownerArg] = captured[0];
		expect(editorArg).toBe(pageEditor);
		expect(ownerArg).toBe(uiOwner);
		expect((ownerArg as { history: unknown }).history).toBe(history);
	});

	it('反例：把页面实例放到 owner 位时 history 为 undefined（即曾经的缺陷形态）', () => {
		const captured: unknown[][] = [];
		Inspector.inputBlur = ((...args: unknown[]) => {
			captured.push(args);
			return () => undefined;
		}) as unknown as typeof Inspector.inputBlur;

		const pageEditor = { target: null, onParamInput: vi.fn() };
		useInspectorInput().bindInput(
			[document.createElement('input')],
			pageEditor as never,
			pageEditor as never
		);

		const ownerArg = captured[0][1] as { history?: unknown };
		expect(ownerArg.history).toBeUndefined();
	});
});
