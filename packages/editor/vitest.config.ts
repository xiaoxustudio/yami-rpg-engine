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
		]
	}
});
