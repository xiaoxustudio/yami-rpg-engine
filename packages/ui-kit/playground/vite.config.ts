import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const __dirname = import.meta.dirname;

export default defineConfig({
	root: resolve(__dirname, '.'),
	plugins: [vue()],
	resolve: {
		alias: {
			'@ui-kit': resolve(__dirname, '../src/index.ts')
		}
	},
	server: {
		host: 'localhost',
		port: 5199,
		strictPort: true
	}
});
