// @type {WebGLRenderingContext}
// oxlint-disable-next-line no-explicit-any
export let GL: any;

interface BackgroundColor {
	r: number;
	g: number;
	b: number;
}

interface WebGLPrototypeBufferData {
	_bufferData: WebGLRenderingContext['bufferData'];
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
}

(() => {
	const canvas = document.createElement('canvas');
	canvas.width = 0;
	canvas.height = 0;
	canvas.style.position = 'absolute';
	canvas.style.width = '100%';
	canvas.style.height = '100%';

	const background: Record<string, BackgroundColor> = {
		light: { r: 0xc8, g: 0xc8, b: 0xc8 },
		dark: { r: 0x20, g: 0x20, b: 0x20 }
	};

	window.addEventListener('themechange', function (event) {
		const { r, g, b } = background[event.value];
		GL.BACKGROUND_RED = r / 255;
		GL.BACKGROUND_GREEN = g / 255;
		GL.BACKGROUND_BLUE = b / 255;
	});

	// 侦听WebGL上下文丢失事件
	canvas.addEventListener('webglcontextlost', function (event) {
		event.preventDefault();
		setTimeout(() => GL.WEBGL_lose_context.restoreContext());
	});

	// 侦听WebGL上下文恢复事件
	canvas.addEventListener('webglcontextrestored', function (_event) {
		GL.restore();
	});

	const options = {
		antialias: false,
		alpha: false,
		depth: true,
		stencil: false,
		premultipliedAlpha: false,
		// 事件驱动渲染：保留缓冲避免事件间隙/页面重绘时展示已清空的缓冲导致闪烁；
		// preserveDrawingBuffer 与 desynchronized 语义冲突（保留缓冲需走常规合成），故不开启 desynchronized
		preserveDrawingBuffer: true
	};

	// 优先使用WebGL2(Win10 DirectX11)
	GL = canvas.getContext('webgl2', options);
	if (!GL) {
		// 回退到WebGL1(Win7 DirectX9以及旧移动设备)
		GL = canvas.getContext('webgl', options);

		GL.getExtension('OES_element_index_uint');

		const vertex_array_object = GL.getExtension('OES_vertex_array_object');
		GL.createVertexArray = vertex_array_object.createVertexArrayOES.bind(vertex_array_object);
		GL.deleteVertexArray = vertex_array_object.deleteVertexArrayOES.bind(vertex_array_object);
		GL.isVertexArray = vertex_array_object.isVertexArrayOES.bind(vertex_array_object);
		GL.bindVertexArray = vertex_array_object.bindVertexArrayOES.bind(vertex_array_object);

		const blend_minmax = GL.getExtension('EXT_blend_minmax');
		GL.MIN = blend_minmax.MIN_EXT;
		GL.MAX = blend_minmax.MAX_EXT;

		const prototype = WebGLRenderingContext.prototype;
		// oxlint-disable-next-line unbound-method
		(prototype as unknown as WebGLPrototypeBufferData)._bufferData = prototype.bufferData;
		(prototype as unknown as WebGLPrototypeBufferData).bufferData = function (
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
		) {
			if (length !== undefined) {
				length *= data.BYTES_PER_ELEMENT;
				data = new Uint8Array(data.buffer, offset, length);
			}
			return this._bufferData(target, data, usage);
		};
	}

	GL.WEBGL_lose_context = GL.getExtension('WEBGL_lose_context');
})();
