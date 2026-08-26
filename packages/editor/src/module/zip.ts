import Path from 'node:path';
import { fs, yauzl } from './constants.ts';

type ZipEntryShape = { fileName: string };
type ZipFileShape = {
	readEntry(): void;
	on(event: 'entry', listener: (entry: ZipEntryShape) => void): void;
	on(event: 'end' | 'error', listener: (err: unknown) => void): void;
	openReadStream(
		entry: ZipEntryShape,
		callback: (err: unknown, readStream: NodeJS.ReadableStream) => void
	): void;
};

export const unzipWithProgress = async ({
	zipPath,
	outputDir,
	onProgress
}: {
	zipPath: string;
	outputDir: string;
	onProgress: (progress: number) => void;
}) => {
	return new Promise((resolve, reject) => {
		let totalFiles = 0;
		let extractedFiles = 0;

		yauzl.open(zipPath, { lazyEntries: true }, (err: unknown, zipfile: ZipFileShape) => {
			if (err) return reject(err);
			zipfile.on('entry', () => {
				totalFiles++;
			});
			zipfile.readEntry();
			zipfile.on('entry', (entry: ZipEntryShape) => {
				const destPath = Path.join(outputDir, entry.fileName);

				if (entry.fileName.endsWith('/')) {
					fs.ensureDirSync(destPath);
					zipfile.readEntry();
					return;
				}

				fs.ensureDirSync(Path.dirname(destPath));

				zipfile.openReadStream(entry, (err: unknown, readStream: NodeJS.ReadableStream) => {
					if (err) return reject(err);

					const writeStream = fs.createWriteStream(destPath);
					readStream.pipe(writeStream);

					writeStream.on('close', () => {
						extractedFiles++;
						const progress = Math.round((extractedFiles / totalFiles) * 100);
						onProgress?.(progress);

						zipfile.readEntry();
					});
				});
			});

			zipfile.on('end', () => {
				resolve('解压完成');
			});

			zipfile.on('error', (err: unknown) => {
				reject(err);
			});
		});
	});
};
