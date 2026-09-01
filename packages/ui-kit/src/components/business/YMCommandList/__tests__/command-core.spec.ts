import { describe, expect, it } from 'vitest';
import {
	createCommandCore,
	type CommandData,
	type CommandRow,
	type CommandRowList
} from '../command-core';

const core = createCommandCore();

const makeCommand = (id: string): CommandData => ({ id, params: {} });

const makeRow = (
	dataItem: CommandData | null,
	dataIndent: number,
	dataKey: boolean
): CommandRow => ({
	dataItem,
	dataIndent,
	dataKey
});

const makeList = (): {
	rows: CommandRowList;
	cmdA: CommandData;
	cmdB: CommandData;
	cmdC: CommandData;
} => {
	const cmdA = makeCommand('a');
	const cmdB = makeCommand('b');
	const cmdC = makeCommand('c');
	const rows = [
		makeRow(cmdA, 0, true),
		makeRow(cmdA, 1, false),
		makeRow(cmdB, 0, true),
		makeRow(cmdB, 1, false),
		makeRow(cmdC, 0, true)
	] as CommandRowList;
	rows.count = rows.length;
	return { rows, cmdA, cmdB, cmdC };
};

describe('command-core', () => {
	describe('compress', () => {
		it('将连续空白压缩为单个空格并去除首尾', () => {
			expect(core.compress('  a   b \n c ')).toBe('a b c');
			expect(core.compress('a\t\tb')).toBe('a b');
		});

		it('空字符串与纯空白返回空字符串', () => {
			expect(core.compress('')).toBe('');
			expect(core.compress(' \t\n ')).toBe('');
		});
	});

	describe('computeTextIndent', () => {
		it('en-US 语言按 4ch 计算', () => {
			expect(core.computeTextIndent(3, 'en-US')).toBe('12ch');
			expect(core.computeTextIndent(0, 'en-US')).toBe('0ch');
		});

		it('其他语言按 2em 计算', () => {
			expect(core.computeTextIndent(2, 'zh-CN')).toBe('4em');
			expect(core.computeTextIndent(1, undefined)).toBe('2em');
		});
	});

	describe('truncateScript', () => {
		it('不超过上限时不截断', () => {
			expect(core.truncateScript('a\nb\nc', 20)).toEqual({
				code: 'a\nb\nc',
				lines: 3,
				visibleLines: 3
			});
			const exact = Array.from({ length: 20 }, (_, i) => `l${i}`).join('\n');
			expect(core.truncateScript(exact, 20)).toEqual({
				code: exact,
				lines: 20,
				visibleLines: 20
			});
		});

		it('超过上限时截断代码并保留总行数', () => {
			const script = Array.from({ length: 25 }, (_, i) => `l${i}`).join('\n');
			const result = core.truncateScript(script, 20);
			expect(result.lines).toBe(25);
			expect(result.visibleLines).toBe(21);
			expect(result.code.split('\n')).toHaveLength(20);
			expect(result.code.endsWith('l19')).toBe(true);
		});
	});

	describe('parseSearchRegExp', () => {
		it('解析 /pattern/flags 形式的字符串', () => {
			const reg = core.parseSearchRegExp('/ab+c/gi');
			expect(reg).toBeInstanceOf(RegExp);
			expect(reg?.source).toBe('ab+c');
			expect(reg?.flags).toBe('gi');
		});

		it('非法标志返回 null，无斜杠时因标志非法同样返回 null', () => {
			expect(core.parseSearchRegExp('/abc/zz')).toBeNull();
			expect(core.parseSearchRegExp('abc')).toBeNull();
		});
	});

	describe('computeSelectRange', () => {
		it('将选区扩展到完整命令块', () => {
			const { rows } = makeList();
			expect(core.computeSelectRange(rows, 1, 2)).toEqual([0, 3]);
			expect(core.computeSelectRange(rows, 1, 1)).toEqual([1, 1]);
		});

		it('交换起止并夹取到有效范围', () => {
			const { rows } = makeList();
			expect(core.computeSelectRange(rows, 99, -5)).toEqual([0, 4]);
		});

		it('选区覆盖尾部空白行时回退 end', () => {
			const { rows, cmdC } = makeList();
			rows.push(makeRow(null, 0, true));
			rows.count = rows.length;
			expect(core.computeSelectRange(rows, 2, 5)).toEqual([2, 4]);
			expect(rows[4].dataItem).toBe(cmdC);
		});
	});

	describe('getSelectUpIndex', () => {
		it('从续行向上跳到主命令行', () => {
			const { rows } = makeList();
			expect(core.getSelectUpIndex(rows, 2, 2)).toBe(0);
			expect(core.getSelectUpIndex(rows, 3, 3)).toBe(2);
		});

		it('起止不属于同一命令时保持 start', () => {
			const { rows } = makeList();
			expect(core.getSelectUpIndex(rows, 1, 2)).toBe(1);
		});
	});

	describe('getSelectDownIndex', () => {
		it('从命令块向下跳到下一个主命令行', () => {
			const { rows } = makeList();
			expect(core.getSelectDownIndex(rows, 0, 1)).toBe(2);
			expect(core.getSelectDownIndex(rows, 2, 3)).toBe(4);
		});

		it('起止不属于同一命令时保持 end', () => {
			const { rows } = makeList();
			expect(core.getSelectDownIndex(rows, 3, 4)).toBe(4);
		});
	});

	describe('getRangeByIndex', () => {
		it('返回索引所属命令块的起止范围', () => {
			const { rows } = makeList();
			expect(core.getRangeByIndex(rows, 1)).toEqual([0, 1]);
			expect(core.getRangeByIndex(rows, 0)).toEqual([0, 1]);
		});

		it('末尾命令或独立命令返回单行范围', () => {
			const { rows } = makeList();
			expect(core.getRangeByIndex(rows, 4)).toEqual([4, 4]);
			expect(core.getRangeByIndex(rows, 3)).toEqual([2, 3]);
		});
	});

	describe('getRangeByData', () => {
		it('按命令数据返回其块范围', () => {
			const { rows, cmdB } = makeList();
			expect(core.getRangeByData(rows, cmdB)).toEqual([2, 3]);
			const cmdX = makeCommand('x');
			const cmdY = makeCommand('y');
			const other = [
				makeRow(cmdX, 0, true),
				makeRow(cmdX, 1, false),
				makeRow(cmdY, 0, true),
				makeRow(cmdY, 1, false)
			] as CommandRowList;
			other.count = other.length;
			expect(core.getRangeByData(other, cmdX)).toEqual([0, 1]);
		});

		it('未找到时返回 [0, 0]，末尾命令的 end 保持初始值 0', () => {
			const { rows, cmdC } = makeList();
			expect(core.getRangeByData(rows, makeCommand('zzz'))).toEqual([0, 0]);
			expect(core.getRangeByData(rows, cmdC)).toEqual([4, 0]);
		});
	});

	describe('tryGetEventId', () => {
		it('callEvent 全局事件返回 eventId', () => {
			expect(
				core.tryGetEventId({ id: 'callEvent', params: { type: 'global', eventId: 'ev1' } })
			).toBe('ev1');
			expect(
				core.tryGetEventId({ id: '!callEvent', params: { type: 'global', eventId: 'ev2' } })
			).toBe('ev2');
		});

		it('非全局或非 callEvent 返回 undefined', () => {
			expect(
				core.tryGetEventId({ id: 'callEvent', params: { type: 'local', eventId: 'ev1' } })
			).toBeUndefined();
			expect(core.tryGetEventId({ id: 'text', params: {} })).toBeUndefined();
			expect(core.tryGetEventId(null)).toBeUndefined();
		});
	});

	describe('enableItems', () => {
		it('移除命令 id 的禁用前缀', () => {
			const commands = [makeCommand('!show'), makeCommand('hide')];
			core.enableItems(commands);
			expect(commands.map((c) => c.id)).toEqual(['show', 'hide']);
		});

		it('已启用的命令保持不变', () => {
			const commands = [makeCommand('show')];
			core.enableItems(commands);
			expect(commands[0].id).toBe('show');
		});
	});

	describe('disableItems', () => {
		it('为命令 id 添加禁用前缀', () => {
			const commands = [makeCommand('show'), makeCommand('!hide')];
			core.disableItems(commands);
			expect(commands.map((c) => c.id)).toEqual(['!show', '!hide']);
		});

		it('已禁用的命令保持不变', () => {
			const commands = [makeCommand('!hide')];
			core.disableItems(commands);
			expect(commands[0].id).toBe('!hide');
		});
	});

	describe('generateExecutableCode', () => {
		it('以 JSON 形式内嵌命令数据', () => {
			const code = core.generateExecutableCode([{ id: 'text', params: { content: 'hi' } }]);
			expect(code.startsWith('const commands = [')).toBe(true);
			expect(code).toContain('"id": "text"');
			expect(code).toContain('"content": "hi"');
		});

		it('包含嵌套命令与执行逻辑', () => {
			const code = core.generateExecutableCode([
				{ id: 'if', params: {}, commands: [{ id: 'text', params: {} }] }
			]);
			expect(code).toContain('"commands"');
			expect(code).toContain('new EventHandler(Command.compile(commands))');
			expect(code).toContain('} catch (err) {');
		});
	});
});
