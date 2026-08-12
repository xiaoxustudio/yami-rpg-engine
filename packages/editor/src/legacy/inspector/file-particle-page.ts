import { Inspector } from './inspector.ts';

{
	interface FileParticleShape {
		[k: string]: any;
	}
	const FileParticle: FileParticleShape = {
		create: null
	};

	FileParticle.create = function (this: typeof FileParticle) {
		return {
			layers: []
		};
	};

	Inspector.fileParticle = FileParticle;
}
