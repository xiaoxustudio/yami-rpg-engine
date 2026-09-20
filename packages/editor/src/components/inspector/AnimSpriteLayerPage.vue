<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animSpriteLayer-properties-grid.label') || 'Sprite Layer'
		}}</DetailSummary>
		<div class="detail-grid" id="animSpriteLayer-properties-grid">
			<div class="text">{{ t('components.animSpriteLayer-sprite.label') || 'Sprite' }}</div>
			<SelectBox
				id="animSpriteLayer-sprite"
				v-tip="t('components.animSpriteLayer-sprite.tip')"
				ref="elSprite"
				v-model="form.sprite"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.animSpriteLayer-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="animSpriteLayer-blend"
				v-tip="t('components.animSpriteLayer-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.animSpriteLayer-light.label') || 'Light Sampling' }}
			</div>
			<SelectBox
				id="animSpriteLayer-light"
				v-tip="t('components.animSpriteLayer-light.tip')"
				ref="elLight"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useAnimSpriteLayerPage } from '@app/composables/useAnimSpriteLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimSpriteLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elSprite = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);

// R2b 迁移⑦：选项名跟随语言。放在 setup 顶层即可——`useLocalizedOptions` 内部用**全局 Composer** +
// `watchEffect`：既跟踪语言切换，也跟踪 `:ref` 挂载后 ref 的赋值（挂载完成时 effect 因读到新 ref
// 重跑，那时才真正 `loadItems`）。原先"监听 `localize` + `local.components` watcher 手工刷新"那套
// 已删除：它在**事件回调**里调用本组合式函数，会抛 vue-i18n 的
// `Must be called at the top of a setup function`（页面自己的选项也由本函数承担，见下）。
useLocalizedOptions('animSpriteLayer-blend', ['normal', 'additive', 'subtract'], (items) =>
	elBlend.value?.loadItems?.(items)
);
useLocalizedOptions('animSpriteLayer-light', ['raw', 'global', 'anchor'], (items) =>
	elLight.value?.loadItems?.(items)
);

onMounted(() => {
	registerElement(inspectorEls, 'animSpriteLayer-sprite', elSprite.value);
	const animSpriteLayer = Inspector.animSpriteLayer;
	if (!animSpriteLayer) return;

	const elements = [elSprite.value?.root, elBlend.value?.root, elLight.value?.root].filter(
		(el): el is HTMLElement => el != null
	);
	bindInput(
		elements,
		animSpriteLayer,
		Animation as unknown as { history: unknown },
		(data: Record<string, unknown>) => {
			data.type = 'inspector-layer-change';
			data.motion = animSpriteLayer.motion;
			data.direction = Animation.direction;
		}
	);

	const el = inspectorEls.get('animSpriteLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
