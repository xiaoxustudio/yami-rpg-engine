import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@app': resolve(__dirname, 'src'),
			'@ui-kit': resolve(__dirname, '../ui-kit/src/index.ts')
		}
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'src',
					environment: 'jsdom',
					setupFiles: ['./vitest.setup.ts'],
					include: ['src/**/*.spec.ts'],
					// 组件挂载类测试较多，全量并行时偶发超过默认 5s 超时（与逻辑无关）
					testTimeout: 20000,
					hookTimeout: 20000
				}
			},
			{
				extends: true,
				test: {
					name: 'main',
					environment: 'node',
					include: ['main/**/*.spec.ts'],
					testTimeout: 20000,
					hookTimeout: 20000
				}
			}
		],
		// 覆盖率口径见 scripts/coverage-ledger.mjs：按目录加权行覆盖率、只许降不许升。
		// 统计范围刻意**只含逻辑层**（stores / services / engine / utils / data / main），
		// 不含 200+ 个 .vue 视图：给 1440 个模块全量插桩会让 fork worker 在启动阶段就超时
		// （2026-10-30 实测：全量 include 时 3 个用例文件连 worker 都起不来，单次 18-23 分钟）。
		// 视图层的回归靠 deferred-window-smoke + 真机 E2E（pnpm e2e）兜，不靠覆盖率数字。
		coverage: {
			provider: 'v8',
			reporter: ['text-summary', 'json-summary'],
			reportsDirectory: 'coverage',
			// 用例失败也要把报告写出来：台账只负责「数字有没有退」，用例红不红是 ci.yml tests job 的事。
			reportOnFailure: true,
			include: [
				'src/engine/**/*.ts',
				'src/stores/**/*.ts',
				'src/services/**/*.ts',
				'src/utils/**/*.ts',
				'src/data/**/*.ts',
				'main/**/*.ts'
			],
			exclude: ['**/*.spec.ts', '**/__tests__/**', '**/*.d.ts']
		}
	}
});
