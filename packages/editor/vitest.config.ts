import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/legacy'),
			'@app': resolve(__dirname, 'src'),
			'@ui-kit': resolve(__dirname, '../ui-kit/src/index.ts')
		}
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.spec.ts']
	}
});
