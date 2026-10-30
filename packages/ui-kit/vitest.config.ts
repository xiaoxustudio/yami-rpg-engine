import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.spec.ts'],
		// 同 editor：只统计逻辑层，不给组件 SFC 全量插桩（理由见 packages/editor/vitest.config.ts）。
		coverage: {
			provider: 'v8',
			reporter: ['text-summary', 'json-summary'],
			reportsDirectory: 'coverage',
			reportOnFailure: true,
			include: ['src/composables/**/*.ts', 'src/utils/**/*.ts'],
			exclude: ['**/*.spec.ts', '**/__tests__/**', '**/*.d.ts']
		}
	}
});
