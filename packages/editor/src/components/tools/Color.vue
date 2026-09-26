<template>
	<WindowFrame ref="frame" id="color" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.color.title') }}
				<div class="close" /></TitleBar
		></template>

		<canvas
			id="color-palette-canvas"
			:ref="registryRef(colorEls, 'color-palette-canvas')"
			width="256"
			height="194"
		/>
		<div
			class="box"
			id="color-palette-frame"
			:ref="registryRef(colorEls, 'color-palette-frame')"
		>
			<div
				class="box"
				id="color-palette-cursor"
				:ref="registryRef(colorEls, 'color-palette-cursor')"
			/>
		</div>
		<div class="grid-box" id="color-index-grid">
			<RadioBox name="color-index" value="0" @input="onIndexedInput" />
			<RadioBox name="color-index" value="1" @input="onIndexedInput" />
			<RadioBox name="color-index" value="2" @input="onIndexedInput" />
			<RadioBox name="color-index" value="3" @input="onIndexedInput" />
			<RadioBox name="color-index" value="4" @input="onIndexedInput" />
			<RadioBox name="color-index" value="5" @input="onIndexedInput" />
			<RadioBox name="color-index" value="6" @input="onIndexedInput" />
			<RadioBox name="color-index" value="7" @input="onIndexedInput" />
			<RadioBox name="color-index" value="8" @input="onIndexedInput" />
			<RadioBox name="color-index" value="9" @input="onIndexedInput" />
			<RadioBox name="color-index" value="10" @input="onIndexedInput" />
			<RadioBox name="color-index" value="11" @input="onIndexedInput" />
			<RadioBox name="color-index" value="12" @input="onIndexedInput" />
			<RadioBox name="color-index" value="13" @input="onIndexedInput" />
			<RadioBox name="color-index" value="14" @input="onIndexedInput" />
			<RadioBox name="color-index" value="15" @input="onIndexedInput" />
		</div>
		<canvas
			id="color-pillar-canvas"
			:ref="registryRef(colorEls, 'color-pillar-canvas')"
			width="20"
			height="256"
		/>
		<div class="box" id="color-pillar-frame" :ref="registryRef(colorEls, 'color-pillar-frame')">
			<div
				class="box"
				id="color-pillar-cursor"
				:ref="registryRef(colorEls, 'color-pillar-cursor')"
			/>
		</div>
		<div class="box" id="color-viewer-frame">
			<div class="box" id="color-viewer" :ref="registryRef(colorEls, 'color-viewer')" />
		</div>
		<div class="grid-box" id="color-rgba-grid">
			<div class="text">#</div>
			<TextBox
				id="color-hex"
				v-tip="t('components.color-hex.tip')"
				:ref="registryRef(colorEls, 'color-hex')"
				v-focus
				v-model="form.hex"
				@beforeinput="onHexBeforeinput"
				@input="onHexInput"
			/>
			<div class="text">R</div>
			<NumberBox
				id="color-r"
				v-tip="t('components.color-r.tip')"
				min="0"
				max="255"
				v-model="form.r"
				@input="onRgbaInput"
			/>
			<div class="text">G</div>
			<NumberBox
				id="color-g"
				v-tip="t('components.color-g.tip')"
				min="0"
				max="255"
				v-model="form.g"
				@input="onRgbaInput"
			/>
			<div class="text">B</div>
			<NumberBox
				id="color-b"
				v-tip="t('components.color-b.tip')"
				min="0"
				max="255"
				v-model="form.b"
				@input="onRgbaInput"
			/>
			<div class="text">A</div>
			<NumberBox
				id="color-a"
				v-tip="t('components.color-a.tip')"
				min="0"
				max="255"
				v-model="form.a"
				@input="onRgbaInput"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Color, colorEls } from '@app/tools/color-picker-window.ts';
import { useColorWindow } from '@app/composables/useColorWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const color = useColorWindow();
const form = color.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onIndexedInput = (value: number | string | boolean) => {
	form.index =
		typeof value === 'string' && value !== '' ? parseInt(value, 10) : (value as number);
	Color?.indexedColorInput?.({ value: String(value) } as Event & { value: string });
};
const onRgbaInput = () => {
	Color?.rgbaInput?.(new Event('input'));
};
const onHexBeforeinput = (event: InputEvent) => {
	Color?.hexBeforeinput?.(event);
};
const onHexInput = () => {
	Color?.hexInput?.(new Event('input'));
};
const onConfirm = () => {
	color.confirm();
};

onMounted(() => {
	// WindowFrame 的 :ref 槽位被 ref="frame" 占用：在挂载后命令式登记窗口元素
	registerElement(colorEls, 'color', frame.value?.root ?? null);
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => color.onWindowClosed());
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#color {
	width: 410px;
	height: 306px;
}

#color-palette-canvas {
	position: absolute;
	left: 10px;
	top: 10px;
	border: var(--input-border);
	border-radius: 2px;
}

#color-palette-frame {
	position: absolute;
	left: 11px;
	top: 11px;
	width: 256px;
	height: 194px;
	overflow: hidden;
}

#color-palette-cursor {
	position: absolute;
	width: 11px;
	height: 11px;
	border: 2px solid #ffffff;
	border-radius: 50%;
	pointer-events: none;
}

#color-index-grid {
	display: grid;
	position: absolute;
	grid-template-columns: repeat(8, 1fr);
	left: 0;
	bottom: 0;
	width: 220px;
	height: 52px;
}

#color-pillar-canvas {
	position: absolute;
	left: 278px;
	top: 10px;
	border: var(--input-border);
	border-radius: 2px;
}

#color-pillar-frame {
	position: absolute;
	left: 270px;
	top: 8px;
	width: 38px;
	height: 262px;
	z-index: 1;
}

#color-pillar-cursor {
	position: absolute;
	width: 100%;
	height: 7px;
	pointer-events: none;
}

#color-viewer-frame {
	position: absolute;
	right: 10px;
	top: 10px;
	width: 90px;
	height: 34px;
	background-clip: content-box;
	background-image: var(--grid-background);
	border: var(--input-border);
	border-radius: 2px;
}

#color-viewer {
	position: absolute;
	width: 100%;
	height: 100%;
}

#color-rgba-grid {
	position: absolute;
	left: auto;
	right: 0;
	top: 44px;
	grid-template-columns: 14px 1fr;
}

#color-hex,
#color-r,
#color-g,
#color-b,
#color-a {
	width: 72px;
	font-family: var(--font-family-mono);
}

#color-confirm {
	width: 90px;
	right: 10px;
	bottom: 34px;
}

#color-cancel {
	width: 90px;
	right: 10px;
	bottom: 10px;
}
</style>
