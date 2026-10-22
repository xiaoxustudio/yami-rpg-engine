<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiAnimation-properties-grid.label') || 'Animation Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiAnimation-properties-grid">
			<div class="text">{{ t('components.uiAnimation-animation.label') || 'Animation' }}</div>
			<CustomBox
				id="uiAnimation-animation"
				v-tip="t('components.uiAnimation-animation.tip')"
				ref="elAnimation"
				:model-value="form.animation"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			></CustomBox>
			<div class="text">{{ t('components.uiAnimation-motion.label') || 'Motion' }}</div>
			<SelectBox
				:label="t('components.uiAnimation-motion.label') || 'Motion'"
				id="uiAnimation-motion"
				v-tip="t('components.uiAnimation-motion.tip')"
				ref="elMotion"
				v-model="form.motion"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiAnimation-autoplay.label') || 'Autoplay' }}</div>
			<CheckBox
				id="uiAnimation-autoplay"
				v-tip="t('components.uiAnimation-autoplay.tip')"
				ref="elAutoplay"
				:model-value="form.autoplay"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.uiAnimation-rotatable.label') || 'Rotatable' }}</div>
			<CheckBox
				id="uiAnimation-rotatable"
				v-tip="t('components.uiAnimation-rotatable.tip')"
				ref="elRotatable"
				:model-value="form.rotatable"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
			<div class="text">{{ t('components.uiAnimation-angle.label') || 'Angle' }}</div>
			<NumberBox
				:label="t('components.uiAnimation-angle.label') || 'Angle'"
				id="uiAnimation-angle"
				v-tip="t('components.uiAnimation-angle.tip')"
				ref="elAngle"
				v-model="form.angle"
				min="0"
				max="360"
				unit="deg"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiAnimation-frame.label') || 'Frame' }}</div>
			<NumberBox
				:label="t('components.uiAnimation-frame.label') || 'Frame'"
				id="uiAnimation-frame"
				v-tip="t('components.uiAnimation-frame.tip')"
				ref="elFrame"
				v-model="form.frame"
				min="0"
				max="10000"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiAnimation-offset-box.label') || 'Offset' }}</div>
			<div id="uiAnimation-offset-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiAnimation-offsetX"
					v-tip="t('components.uiAnimation-offsetX.tip')"
					ref="elOffsetX"
					v-model="form.offsetX"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiAnimation-offsetY"
					v-tip="t('components.uiAnimation-offsetY.tip')"
					ref="elOffsetY"
					v-model="form.offsetY"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/element-animation-page.ts';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIAnimationPage } from '@app/composables/useUIAnimationPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { bindInput } = useInspectorInput();

const { form, sync, onParamInput: onParamInputEvent } = useUIAnimationPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

/**
 * 动画 id 变更：重算动作列表。原先是在 `onMounted` 里用元素优先 API 挂 DOM 监听。
 *
 * `@write` 给的是 **emit 出来的 value**，而 `UIAnimation.animationIdWrite` 读的是
 * **`event.value`**（元素优先时代 DOM 事件带的载荷形状），故这里重新包一层 ——
 * 与 `SceneAnimationPropertiesSection` / `FileActorPropertiesSection` 已有的写法一致。
 *
 * ⚠️ 必须用 `motionReady` 闸门**保住原先的附加时机**（实测踩出来的）：
 * `CustomBox` 在自己的 `onMounted` 里会 `write(modelValue)` 一次，而 `YMCustomBox.write()`
 * **无条件** `emit('write')`；子组件先挂，模板 `@` 又从首次渲染就生效 ——
 * 于是这次"初始化写值"会在父组件 `onMounted` 里
 * `registerElement(inspectorEls, 'uiAnimation-motion', …)` **之前**打到 `animationIdWrite`，
 * 那里 `inspectorEls.get('uiAnimation-motion')` 仍是 `undefined`，
 * 报 `Cannot read properties of undefined (reading 'loadItems')`。
 * 旧写法把监听挂在父 `onMounted` 里（且在所有 `registerElement` 之后），因而天然早退。
 */
const motionReady = ref(false);
const onAnimationIdWrite = (value: unknown): void => {
	if (!motionReady.value) return;
	Inspector?.uiAnimation?.animationIdWrite?.({ value });
};

const elAnimation = ref<InstanceType<typeof CustomBox> | null>(null);
const elMotion = ref<InstanceType<typeof SelectBox> | null>(null);
const elAutoplay = ref<InstanceType<typeof CheckBox> | null>(null);
const elRotatable = ref<InstanceType<typeof CheckBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elFrame = ref<InstanceType<typeof NumberBox> | null>(null);
const elOffsetX = ref<InstanceType<typeof NumberBox> | null>(null);
const elOffsetY = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiAnimation-motion', elMotion.value);
	// 注册表填好之后才允许 `@write` 生效 —— 等价于原先"在 onMounted 里挂监听"的时机，
	// 用来吞掉 CustomBox 挂载期那次初始化 `write`（见 onAnimationIdWrite 的注释）。
	motionReady.value = true;
	const uiAnimation = Inspector.uiAnimation;
	if (!uiAnimation) return;
	const elements = [
		elAnimation.value?.root,
		elMotion.value?.root,
		elAutoplay.value?.root,
		elRotatable.value?.root,
		elAngle.value?.root,
		elFrame.value?.root,
		elOffsetX.value?.root,
		elOffsetY.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, getUIStore(), uiAnimation);

	const el = inspectorEls.get('uiAnimation-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
