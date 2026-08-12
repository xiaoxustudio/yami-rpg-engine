import { BaseTexture } from './base-texture.ts';

interface ShaderProgramShape {
	use(): void;
	vao: unknown;
}

interface GLShape {
	arrays: { 0: { float32: Uint32Array } };
	textureManager: { map: Record<string, BaseTexture> };
	maxTexUnits: number;
	program: ShaderProgramShape | null;
	bindVertexArray: (vao: unknown) => void;
	bufferData: (
		target: GLenum,
		data: {
			BYTES_PER_ELEMENT: number;
			buffer: ArrayBufferLike;
			byteLength: number;
			byteOffset: number;
		},
		usage: GLenum,
		offset: number,
		length: number
	) => void;
	ARRAY_BUFFER: GLenum;
	STREAM_DRAW: GLenum;
	blend: string;
	updateBlending: () => void;
	activeTexture: (unit: GLenum) => void;
	TEXTURE0: GLenum;
	bindTexture: (target: GLenum, texture: WebGLTexture | null) => void;
	TEXTURE_2D: GLenum;
	updateSamplerNum: (count: number) => void;
	drawElements: (mode: GLenum, count: number, type: GLenum, offset: number) => void;
	TRIANGLES: GLenum;
	UNSIGNED_INT: GLenum;
}

export class BatchRenderer {
	response: Uint32Array;
	// 以下字段在 constructor 内由词法 const 挂载（箭头函数闭包），统一用函数类型契约
	setAttrSize: (size: number) => void;
	getEndIndex: () => number;
	setBlendMode: (blend: string) => void;
	bindProgram: (program: ShaderProgramShape) => void;
	unbindProgram: () => void;
	push: (texIndex: number) => void;
	draw: () => void;

	constructor(gl: GLShape) {
		const vertices = gl.arrays[0].float32;
		const texMap = gl.textureManager.map;
		const texUnits = gl.maxTexUnits - 1;
		const queue = new Uint32Array(512 * 512);
		const step = texUnits + 3;
		const samplers = new Int8Array(10000).fill(-1);
		const response = new Uint32Array(2);
		let attrSize = 0;
		let queueIndex = 0;
		let samplerLength = 0;
		let startIndex = 0;
		let endIndex = 0;
		let blendMode = 'normal';
		let program: ShaderProgramShape | null = null;

		const setAttrSize = (size: number) => {
			attrSize = size;
		};

		const getEndIndex = () => {
			return endIndex;
		};

		const setBlendMode = (blend: string) => {
			if (blendMode !== blend) {
				draw();
				blendMode = blend;
			}
		};

		const bindProgram = () => {
			program = gl.program;
		};

		const unbindProgram = () => {
			program = null;
		};

		const push = (texIndex: number) => {
			let samplerIndex = samplers[texIndex];
			if (samplerIndex === -1) {
				samplerIndex = samplerLength;
				if (samplerIndex === texUnits) {
					for (let i = 0; i < samplerLength; i++) {
						samplers[queue[queueIndex + i]] = -1;
					}
					const offset = queueIndex + texUnits;
					queue[offset] = samplerLength;
					queue[offset + 1] = startIndex;
					queue[offset + 2] = endIndex;
					startIndex = endIndex;
					queueIndex += step;
					samplerLength = 0;
					samplerIndex = 0;
				}
				queue[queueIndex + samplerIndex] = texIndex;
				samplers[texIndex] = samplerIndex;
				samplerLength += 1;
			}
			response[0] = endIndex;
			response[1] = samplerIndex;
			endIndex += 4;
		};

		const draw = () => {
			if (endIndex !== 0) {
				if (samplerLength !== 0) {
					for (let i = 0; i < samplerLength; i++) {
						samplers[queue[queueIndex + i]] = -1;
					}
					const offset = queueIndex + texUnits;
					queue[offset] = samplerLength;
					queue[offset + 1] = startIndex;
					queue[offset + 2] = endIndex;
					queueIndex += step;
					samplerLength = 0;
				}
				if (program !== null && program !== gl.program) {
					program.use();
					gl.bindVertexArray(program.vao);
				}
				const vLength = endIndex * attrSize;
				if (vLength > 0) {
					gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vLength);
				}
				gl.blend = blendMode;
				gl.updateBlending();
				for (let qi = 0; qi < queueIndex; qi += step) {
					const offset = qi + step;
					const length = queue[offset - 3];
					const start = queue[offset - 2] * 1.5;
					const end = queue[offset - 1] * 1.5;
					for (let si = length - 1; si >= 0; si--) {
						gl.activeTexture(gl.TEXTURE0 + si);
						gl.bindTexture(gl.TEXTURE_2D, texMap[queue[qi + si]].glTexture);
					}
					gl.updateSamplerNum(length);
					gl.drawElements(gl.TRIANGLES, end - start, gl.UNSIGNED_INT, start * 4);
				}
				queueIndex = 0;
				startIndex = 0;
				endIndex = 0;
			}
		};

		this.response = response;
		this.setAttrSize = setAttrSize;
		this.getEndIndex = getEndIndex;
		this.setBlendMode = setBlendMode;
		this.bindProgram = bindProgram;
		this.unbindProgram = unbindProgram;
		this.push = push;
		this.draw = draw;
	}
}
