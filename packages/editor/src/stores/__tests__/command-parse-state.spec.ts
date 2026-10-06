import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive, markRaw } from 'vue';
import { WordList } from '@ui-kit';
import { getCommandStore } from '@app/stores/command';
import { commandState } from '@app/composables/useCommandState.ts';

// 回归：指令解析态从「模块级 reactive」升进 `stores/command.ts`（`parse`）。
// 这两个断言钉住两件事：
//  ① 兼容对象 `commandState` 是 store 的**访问器**（读写都落在 store 上），
//     94 处 `commandState.x` 调用点不用改；
//  ② `words` 仍走 `markRaw`：WordList 用私有字段 `#arr`，被包成 Proxy 一调用就抛。
//
// 注意：`getCommandStore()` 显式传 `stores/pinia.ts` 的实例（不依赖 active pinia），
// 所以这里不用 `setActivePinia`，改为逐用例复位 parse 状态，保证顺序无关。

describe('commandState → stores/command.parse', () => {
	beforeEach(() => {
		const { parse } = getCommandStore();
		parse.target = null;
		parse.id = null;
		// ⚠️ 必须 markRaw：直接放未标记的实例会被 reactive 包成 Proxy，WordList 的私有字段
		// `#arr` 一调用就抛（`commands/schema.ts:270` / 本文件下一个用例都在钉这条）
		parse.words = markRaw(new WordList());
		parse.invalid = false;
		parse.saveVars = false;
		parse.returnType = '';
		parse.eventName = '';
		parse.eventIndex = 0;
		parse.variables = [];
		parse.varMap = {};
		parse.currentCommand = null;
	});

	it('读写落在 store 上（双向一致）', () => {
		commandState.id = 'set-variable';
		commandState.eventName = 'onLoad';
		commandState.eventIndex = 3;
		commandState.invalid = true;

		const { parse } = getCommandStore();
		expect(parse.id).toBe('set-variable');
		expect(parse.eventName).toBe('onLoad');
		expect(parse.eventIndex).toBe(3);
		expect(parse.invalid).toBe(true);

		// 反向：直接改 store 也能从兼容对象读到
		parse.returnType = 'number';
		expect(commandState.returnType).toBe('number');
	});

	it('数组/对象字段是同一个引用（就地 push / 赋值都能被 store 看见）', () => {
		const { parse } = getCommandStore();
		parse.variables = [];
		commandState.variables.push({
			name: 'v1',
			type: 'number',
			comment: '',
			evIndex: 0,
			isLeftValue: true,
			refCount: 0
		});
		expect(parse.variables).toHaveLength(1);

		commandState.varMap = { a: 1 };
		expect(parse.varMap).toEqual({ a: 1 });
	});

	it('words 仍是未被代理的 WordList（markRaw）', () => {
		const words = commandState.words;
		expect(words).toBeInstanceOf(WordList);
		expect(isReactive(words)).toBe(false);

		// 私有字段能正常访问（被代理就会抛 "Cannot read private member #arr"）
		expect(words.push('abc')).toBe(words);
		expect(getCommandStore().parse.words).toBe(words);
	});
});
