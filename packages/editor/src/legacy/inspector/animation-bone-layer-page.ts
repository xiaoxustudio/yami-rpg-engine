import { Inspector } from './inspector.ts';

{
	interface AnimJointLayerShape {
		[k: string]: any;
	}
	const AnimJointLayer: AnimJointLayerShape = {
		create: null
	};

	AnimJointLayer.create = function (this: typeof AnimJointLayer) {
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
