import { Inspector } from './inspector.ts';

{
	const AnimJointLayer = {
		create: null as any
	};

	AnimJointLayer.create = function (this: any) {
		return {
			class: 'joint',
			name: 'Joint',
			expanded: true,
			hidden: false,
			locked: false,
			frames: [Inspector.animJointFrame.create()],
			children: []
		};
	};

	Inspector.animJointLayer = AnimJointLayer;
}
