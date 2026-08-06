import { Inspector } from './inspector.ts';

{
	const FileParticle = {
		create: null as any
	};

	FileParticle.create = function (this: any) {
		return {
			layers: []
		};
	};

	Inspector.fileParticle = FileParticle;
}
