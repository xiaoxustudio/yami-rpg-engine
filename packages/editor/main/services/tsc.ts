import { app } from 'electron';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import fs from 'fs';
import { fork, spawn, type ChildProcess } from 'child_process';
import path from 'path';
import { getEditorWindow } from '../window-registry.ts';

// 模块所在目录（dist-electron/），不依赖 import.meta.url 或 CJS __dirname 全局
const __dirname = path.resolve(app.getAppPath(), 'dist-electron');

let tscProcess: ChildProcess | null = null;

// 获取tsc原生可执行文件路径
function getTsgoExePath(): string {
	const platform = process.platform;
	const arch = process.arch;
	const expectedPackage = 'typescript-' + platform + '-' + arch;
	const platformPackageName = '@typescript/' + expectedPackage;
	let exeDir;
	try {
		const packageJsonPath = require.resolve(platformPackageName + '/package.json');
		exeDir = path.join(path.dirname(packageJsonPath), 'lib');
	} catch {
		try {
			const nativePreviewDir = path.dirname(require.resolve('typescript/package.json'));
			exeDir = path.join(nativePreviewDir, '..', expectedPackage, 'lib');
		} catch {
			const nodeModulesDir = path.resolve(__dirname, '../node_modules');
			exeDir = path.join(nodeModulesDir, platformPackageName, 'lib');
		}
	}
	let exe = path.join(exeDir, 'tsc');
	if (platform === 'win32') {
		exe += '.exe';
		if (exe.length >= 248) {
			exe = '\\\\?\\' + exe;
		}
	}
	if (!fs.existsSync(exe)) {
		throw new Error('Executable not found: ' + exe);
	}
	return exe;
}

// 启动TSC
function startTSC(projectDir: string) {
	if (tscProcess) {
		stopTSC(() => startTSC(projectDir));
		return;
	}
	let tscExe = null;
	try {
		tscExe = getTsgoExePath();
	} catch {
		tscExe = require.resolve('typescript/lib/tsc');
	}
	const process = fork(tscExe, ['--watch'], {
		stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
		cwd: projectDir
	});
	tscProcess = process;
	process.stdout?.on('data', (data: Buffer | string) => {
		const editor = getEditorWindow();
		if (editor && !editor.isDestroyed()) editor.send(CHANNELS.send.tscLog, data.toString());
	});
	process.stderr?.on('data', (data: Buffer | string) => {
		const editor = getEditorWindow();
		if (editor && !editor.isDestroyed()) editor.send(CHANNELS.send.tscLog, data.toString());
	});
}

// 停止TSC
function stopTSC(callback?: () => void) {
	if (tscProcess) {
		tscProcess.kill();
		tscProcess.on('close', () => {
			tscProcess = null;
			callback?.();
		});
	} else {
		callback?.();
	}
}

export type CompileTscFileResult = { res?: string; error?: unknown };

/**
 * 原生 tsgo 分支：通过标准输入/输出把单段脚本编译成 ESNext 文本。
 *
 * 调用方必须先用 `getTsgoExePath()` 确认平台包存在——本函数不负责回退，
 * 否则会把「编译失败（类型错误）」和「编译器缺失」两种结果混为一谈。
 */
function compileWithTsgo(code: string): Promise<CompileTscFileResult> {
	const tsgo = spawn(
		getTsgoExePath(),
		['--target', 'ES2022', '--module', 'ESNext', '--outFile', '-'],
		{
			stdio: ['pipe', 'pipe', 'pipe']
		}
	);

	let stdout = '';
	let stderr = '';
	tsgo.stdout?.on('data', (data: Buffer | string) => {
		stdout += data.toString();
	});
	tsgo.stderr?.on('data', (data: Buffer | string) => {
		stderr += data.toString();
	});

	tsgo.stdin?.write(code);
	tsgo.stdin?.end();

	return new Promise<CompileTscFileResult>((resolve) => {
		tsgo.on('error', (error) => resolve({ error }));
		tsgo.on('close', (exitCode) => {
			if (exitCode !== 0) {
				resolve({ error: new Error(stderr || 'Compilation failed') });
			} else {
				resolve({ res: stdout });
			}
		});
	});
}

/**
 * 进程内转译回退：不依赖平台二进制、不起子进程。
 *
 * 与 tsgo 分支的**刻意差异**：`transpileModule` 只做语法转译、不做类型检查，
 * 因此类型错误不会在这里报出来。这是必要的取舍——`typescript@6.0.3` 并不声明
 * `@typescript/typescript-<platform>-<arch>` 这个可选依赖（`typescript@7` 才声明），
 * 所以只有 `startTSC` 单方面回退时，本函数会必抛「Executable not found」，
 * 导致每次保存 TS 脚本都弹「编译错误」对话框。
 */
function transpileWithTypescriptApi(ts: typeof import('typescript'), code: string): string {
	const output = ts.transpileModule(code, {
		compilerOptions: {
			target: ts.ScriptTarget.ES2022,
			module: ts.ModuleKind.ESNext
		},
		reportDiagnostics: true
	});

	// `transpileModule` 默认对语法错误一声不吭，会把半成品当成功返回；
	// 这里显式升级成 error，让调用方的「编译错误」分支照常生效。
	const errors = (output.diagnostics ?? []).filter(
		(diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
	);
	if (errors.length !== 0) {
		throw new Error(
			ts.formatDiagnostics(errors, {
				getCanonicalFileName: (fileName: string) => fileName,
				getCurrentDirectory: () => '',
				getNewLine: () => '\n'
			})
		);
	}

	return output.outputText;
}

export const compileTscFile = async (code: string): Promise<CompileTscFileResult> => {
	let tsgoExe: string | null = null;
	try {
		tsgoExe = getTsgoExePath();
	} catch {
		tsgoExe = null;
	}

	if (tsgoExe !== null) {
		return compileWithTsgo(code);
	}

	try {
		// external 化的动态 import：CJS 产物里落成 require，不会把编译器打进主进程包
		const ts = await import('typescript');
		return { res: transpileWithTypescriptApi(ts, code) };
	} catch (error) {
		return { error };
	}
};

export { startTSC, stopTSC };
