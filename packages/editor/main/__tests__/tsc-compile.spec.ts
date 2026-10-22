// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
	app: { getAppPath: () => process.cwd(), getPath: () => '' }
}));

const { compileTscFile } = await import('../services/tsc.ts');

describe('compileTscFile 编译器回退链', () => {
	it('缺少原生 tsgo 平台包时退回进程内转译，而不是返回 error', async () => {
		const result = await compileTscFile('const value: number = 1;');
		expect(result.error).toBeUndefined();
		expect(result.res).toBeTruthy();
	});

	it('退回路径确实产出 ESNext 文本（类型注解被抹掉）', async () => {
		const source = [
			'interface Shape { name: string }',
			'const shape: Shape = { name: "yami" };',
			'export { shape };'
		].join('\n');
		const result = await compileTscFile(source);
		expect(result.error).toBeUndefined();
		const output = result.res ?? '';
		expect(output).not.toContain('interface Shape');
		expect(output).not.toContain(': Shape');
		expect(output).toContain('yami');
	});

	it('语法错误会以 error 形式返回，而不是静默产出半成品', async () => {
		const result = await compileTscFile('const = ;');
		expect(result.res).toBeUndefined();
		expect(result.error).toBeInstanceOf(Error);
	});
});
