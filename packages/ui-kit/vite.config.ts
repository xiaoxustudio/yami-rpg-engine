import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
			name: 'YamiUiKit',
			fileName: 'ui-kit'
		},
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: { vue: 'Vue' }
			}
		}
	}
});
