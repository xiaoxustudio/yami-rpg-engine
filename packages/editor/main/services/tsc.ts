import { app } from 'electron';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import fs from 'fs';
import { fork, spawn, type ChildProcess } from 'child_process';
import path from 'path';

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
		const editor = (globalThis as any).editor;
		if (editor && !editor.isDestroyed()) editor.send(CHANNELS.send.tscLog, data.toString());
	});
	process.stderr?.on('data', (data: Buffer | string) => {
		const editor = (globalThis as any).editor;
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

export const compileTscFile = async (code: string) => {
	let res, error;
	try {
		// 使用tsgo可执行文件编译，通过标准输入/输出处理代码
		const tsgo = spawn(
			getTsgoExePath(),
			['--target', 'ES2022', '--module', 'ESNext', '--outFile', '-'],
			{
				stdio: ['pipe', 'pipe', 'pipe']
			}
		);

		let stdout = '',
			stderr = '';
		tsgo.stdout.on('data', (data) => {
			stdout += data.toString();
		});
		tsgo.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		tsgo.stdin.write(code);
		tsgo.stdin.end();

		await new Promise((resolve, reject) => {
			tsgo.on('close', (code) => {
				if (code !== 0) {
					error = new Error(stderr || 'Compilation failed');
				} else {
					res = stdout;
				}
				resolve(undefined);
			});
			tsgo.on('error', reject);
		});
	} catch (e) {
		error = e;
	}
	return { res, error };
};

export { startTSC, stopTSC };
