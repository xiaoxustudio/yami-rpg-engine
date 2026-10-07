<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animSpriteLayer-properties-grid.label') || 'Sprite Layer'
		}}</DetailSummary>
		<div class="detail-grid" id="animSpriteLayer-properties-grid">
			<div class="text">{{ t('components.animSpriteLayer-sprite.label') || 'Sprite' }}</div>
			<SelectBox
				:label="t('components.animSpriteLayer-sprite.label') || 'Sprite'"
				id="animSpriteLayer-sprite"
				v-tip="t('components.animSpriteLayer-sprite.tip')"
				ref="elSprite"
				v-model="form.sprite"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.animSpriteLayer-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.animSpriteLayer-blend.label') || 'Blend'"
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
				:label="t('components.animSpriteLayer-light.label') || 'Light Sampling'"
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
	bindInput(elements, animSpriteLayer, Animation, (data: Record<string, unknown>) => {
		data.type = 'inspector-layer-change';
		data.motion = animSpriteLayer.motion;
		data.direction = Animation.direction;
	});

	const el = inspectorEls.get('animSpriteLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
