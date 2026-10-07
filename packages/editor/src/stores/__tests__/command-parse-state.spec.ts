import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive, markRaw } from 'vue';
import { WordList } from '@ui-kit';
import { getCommandStore } from '@app/stores/command';
import { commandState } from '@app/composables/useCommandState.ts';

describe('commandState → stores/command.parse', () => {
	beforeEach(() => {
		const { parse } = getCommandStore();
		parse.target = null;
		parse.id = null;
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

		expect(words.push('abc')).toBe(words);
		expect(getCommandStore().parse.words).toBe(words);
	});
});
