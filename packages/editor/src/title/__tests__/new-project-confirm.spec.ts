import { describe, expect, it } from 'vitest';
import { newProjectConfirmAllowed } from '@app/title/new-project-window.ts';

/**
 * `NewProject.confirm` 的放行判定 —— 顺带钉住一处**恒真的死逻辑**。
 *
 * 事故形态（`891cf657` 引入）：第三项写成
 * `template != (['arpg-ts-english', 'arpg-ts-chinese'] as unknown as string)`。
 * 数组被当成字符串参与比较，运行期退化成 `template != 'arpg-ts-english,arpg-ts-chinese'`
 * —— 对任何真实模板值都成立 ⇒ `else` 分支（`confirmation.resource-not-found` 提示）
 * **永远不会执行**，资源缺失时也照样新建。
 *
 * 真值表只有四行，所以直接钉住。**本文件在改之前必然是红的**：
 * 恒真 ⇒ 下面「资源缺失 ⇒ 拦下」那条会拿到 `true`。
 */
const ready = () => true;
const missing = () => false;

describe('NewProject.confirm：资源缺失时是否拦下', () => {
	it('ARPG 模板 + 资源齐全 ⇒ 放行', () => {
		expect(newProjectConfirmAllowed('arpg-ts-english', ready)).toBe(true);
		expect(newProjectConfirmAllowed('arpg-ts-chinese', ready)).toBe(true);
	});

	it('ARPG 模板 + 资源缺失 ⇒ 拦下（改之前这里恒为 true）', () => {
		expect(newProjectConfirmAllowed('arpg-ts-english', missing)).toBe(false);
		expect(newProjectConfirmAllowed('arpg-ts-chinese', missing)).toBe(false);
	});

	it('只按**被选中的那个**模板问资源', () => {
		const asked: string[] = [];
		newProjectConfirmAllowed('arpg-ts-chinese', (key) => {
			asked.push(key);
			return true;
		});
		expect(asked).toEqual(['arpg-ts-chinese']);
	});

	it('非 ARPG 模板（「最小化当前项目」等）与空值 ⇒ 放行，且根本不去问资源', () => {
		// 第三项的本职就是这个：它必须让「最小化当前项目」这种**没有对应资源包**的选项通过。
		const asked: string[] = [];
		const spy = (key: string) => {
			asked.push(key);
			return false;
		};
		expect(newProjectConfirmAllowed('minimized-project', spy)).toBe(true);
		expect(newProjectConfirmAllowed(undefined, spy)).toBe(true);
		expect(newProjectConfirmAllowed(null, spy)).toBe(true);
		expect(asked).toEqual([]);
	});
});
