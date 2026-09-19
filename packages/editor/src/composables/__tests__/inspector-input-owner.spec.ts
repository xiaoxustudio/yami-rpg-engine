/**
 * 回归测试：`bindInput` 的 editor / owner **实参顺序**。
 *
 * 契约（`useInspectorInput.bindInput`）：
 *   `bindInput(elements, editor, owner, callback)`
 *   → `Inspector.inputBlur(editor, owner, callback)`
 *   → `inspector.ts:503` 执行 `owner.history!.save(data)`
 *
 * 也就是：**第 2 参 = editor（要编辑的对象，需有 target）**，
 *        **第 3 参 = owner（历史所有者，需有 history）**。
 *
 * 缺陷背景（2026-09-17 修复）：
 *   迁移前 `inspector/element-page.ts:133` 的正确形态是
 *     `on(el, 'blur', Inspector.inputBlur!(this, UI))`   // (editor = 页面实例, owner = UI)
 *   10 个 UI 检查器页面重构进 `bindInput` 时把两者**转置**成
 *     `bindInput(elements, UI, <页面实例>)`              // editor 位放了 UI，owner 位放了页面实例
 *   于是 `owner.history` = `<页面实例>.history` = undefined，
 *   blur 一旦落到保存分支就抛 TypeError。
 *
 * 为什么需要这个用例：两个形参都是结构类型，`as unknown as {...}` 能让编译器闭嘴
 * （生产代码里原本就是这么绕过的），所以类型检查拦不住转置。只能靠断言守住。
 */
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
		// owner 位：UI 单例的替代物，契约要求它有 history
		const uiOwner = { target: { id: 'animation' }, history };
		// editor 位：检查器页实例。它**没有** history —— 这正是被转置时会炸的原因
		const pageEditor = { target: { id: 'animation' }, onParamInput: vi.fn() };
		const elements = [document.createElement('input')];

		useInspectorInput().bindInput(elements, pageEditor as never, uiOwner as never);

		expect(captured).toHaveLength(1);
		const [editorArg, ownerArg] = captured[0];
		// 第 2 参（editor）应是页面实例
		expect(editorArg).toBe(pageEditor);
		// 第 3 参（owner）应是带 history 的对象
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
		// 转置后的形态：owner 位放的是页面实例
		useInspectorInput().bindInput(
			[document.createElement('input')],
			pageEditor as never,
			pageEditor as never
		);

		const ownerArg = captured[0][1] as { history?: unknown };
		expect(ownerArg.history).toBeUndefined();
		// 这条断言的意义：证明「转置」在运行时确实是坏的，而不是无害的风格差异
	});
});
