import { describe, expect, it } from 'vitest';
import { WordList } from '../useWordList';

describe('WordList', () => {
	it('pushes non-empty strings and reports length', () => {
		const list = new WordList();
		expect(list.push('a')).toBe(list);
		list.push('b');
		list.push('');
		expect(list.length).toBe(2);
	});

	it('joins with default joint and resets count', () => {
		const list = new WordList();
		list.push('a').push('b');
		const joined = list.join();
		expect(joined).toBe('a$_delimiter_$, $_/_$b');
		expect(list.count).toBe(0);
	});

	it('joins with custom joint', () => {
		const list = new WordList();
		list.push('x').push('y');
		expect(list.join('-')).toBe('x-y');
	});

	it('returns empty string when no words', () => {
		const list = new WordList();
		expect(list.join()).toBe('');
	});

	it('is iterable', () => {
		const list = new WordList();
		list.push('a').push('b');
		expect([...list]).toEqual(['a', 'b']);
	});
});
