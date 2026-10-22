export interface ApkConfig {
	apkPath: string;
	outputDir: string;
	newApkPath: string;
	apktoolPath: string;
	packageName: string;
	appName: string;
	iconPath: string;
	versionName: string;
	versionCode: number;
	isSign: boolean;
	jksPath: string;
	keyStorePassword: string;
	keyAlias: string;
	keyPassword: string;
	apksignerPath: string;
	signedApkPath: string;
	zipalignPath: string;
	projectPath: string;
}

export interface ApkOptions {
	config?: Partial<ApkConfig>;
	onProgress?: (message: string, progress: number) => void;
	signal?: AbortSignal;
}

export type ApkResult = boolean;
