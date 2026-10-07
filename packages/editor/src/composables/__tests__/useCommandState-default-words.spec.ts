import { describe, expect, it } from 'vitest';
import { markRaw } from 'vue';
import { commandState } from '../useCommandState.ts';
import { WordList } from '../useWordList.ts';

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

		commandState.words = markRaw(new WordList());
		expect(commandState.words).not.toBe(first);
		expect(commandState.words.length).toBe(0);

		commandState.words.push('b');
		expect(commandState.words.length).toBe(1);
	});
});
