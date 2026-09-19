import { describe, expect, it } from 'vitest';
import { markRaw } from 'vue';
import { commandState } from '../useCommandState.ts';
import { WordList } from '../useWordList.ts';

/**
 * `commandState.words` 的默认值契约。
 *
 * 默认就是一个空 `WordList`（而不是过去的 `null as unknown as WordListShape`），
 * 因此任何时刻 `words` 都可用、184 个读点不需要判空；每次解析再换成新实例。
 */
describe('commandState.words 默认值', () => {
	it('构造后就是空 WordList（不是 null）', () => {
		expect(commandState.words).toBeInstanceOf(WordList);
		expect(commandState.words.length).toBe(0);
		commandState.words.push('a');
		expect(commandState.words.length).toBe(1);
		commandState.words.join();
		expect(commandState.words.length).toBe(0);
	});

	it('解析入口的换新动作：必须 markRaw 后再赋（否则 reactive 会包成 Proxy）', () => {
		const first = commandState.words;

		// 与 `schema.ts` 的 `Command.words = markRaw(new Command.WordList())` 一致。
		// 这里刻意不用 markRaw 是**会炸**的：reactive() 会把普通实例包成 Proxy，而 WordList
		// 内部用私有字段 `#arr`，在 Proxy 上访问会抛
		// 「Cannot read private member #arr from an object whose class did not declare it」。
		commandState.words = markRaw(new WordList());
		expect(commandState.words).not.toBe(first);
		expect(commandState.words.length).toBe(0);

		commandState.words.push('b');
		expect(commandState.words.length).toBe(1);
	});
});
