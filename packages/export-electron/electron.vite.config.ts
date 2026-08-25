import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		build: {
			outDir: 'out/main',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/main/index.ts')
				}
			}
		}
	},
	renderer: {
		build: {
			outDir: 'out/renderer',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/renderer/index.html')
				}
			}
		}
	}
});
