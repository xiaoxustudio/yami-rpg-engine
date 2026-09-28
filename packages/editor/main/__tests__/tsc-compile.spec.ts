// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

// tsc.ts 顶层用 app.getAppPath() 推导 dist-electron 目录，node 环境下必须替身
vi.mock('electron', () => ({
	app: { getAppPath: () => process.cwd(), getPath: () => '' }
}));

const { compileTscFile } = await import('../services/tsc.ts');

describe('compileTscFile 编译器回退链', () => {
	/**
	 * 回归：仓库当前安装的 `typescript@6.0.3` 不声明
	 * `@typescript/typescript-<platform>-<arch>` 可选依赖，`getTsgoExePath()` 必抛。
	 * 修复前该分支直接 `spawn(getTsgoExePath(), …)`，异常被 catch 成 `error`，
	 * 于是保存 TS 脚本每次都会弹「编译错误」对话框。
	 */
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
		// interface 是纯类型，必须消失
		expect(output).not.toContain('interface Shape');
		// 类型注解必须消失
		expect(output).not.toContain(': Shape');
		// 值仍然保留
		expect(output).toContain('yami');
	});

	it('语法错误会以 error 形式返回，而不是静默产出半成品', async () => {
		const result = await compileTscFile('const = ;');
		expect(result.res).toBeUndefined();
		expect(result.error).toBeInstanceOf(Error);
	});
});
