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
/* oxlint-disable eslint/no-restricted-properties */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useAnimSpriteLayerPage } from '@app/composables/useAnimSpriteLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useLocalStore } from '@app/stores/local';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();
const local = useLocalStore();

const { form, sync, onParamInput: onParamInputEvent } = useAnimSpriteLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const getOptions = (id: string) =>
	local.components?.[id]?.options as Record<string, { name?: string }> | undefined;

const { bindInput } = useInspectorInput();

const elSprite = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'animSpriteLayer-sprite', elSprite.value);
	const animSpriteLayer = Inspector.animSpriteLayer;
	if (!animSpriteLayer) return;

	elBlend.value?.loadItems([
		{
			name: getOptions('animSpriteLayer-blend')?.normal?.name || 'Normal',
			value: 'normal'
		},
		{
			name: getOptions('animSpriteLayer-blend')?.additive?.name || 'Additive',
			value: 'additive'
		},
		{
			name: getOptions('animSpriteLayer-blend')?.subtract?.name || 'Subtract',
			value: 'subtract'
		}
	]);
	elLight.value?.loadItems([
		{
			name: getOptions('animSpriteLayer-light')?.raw?.name || 'Raw',
			value: 'raw'
		},
		{
			name: getOptions('animSpriteLayer-light')?.global?.name || 'Global Sampling',
			value: 'global'
		},
		{
			name: getOptions('animSpriteLayer-light')?.anchor?.name || 'Anchor Sampling',
			value: 'anchor'
		}
	]);

	const elements = [elSprite.value?.root, elBlend.value?.root, elLight.value?.root].filter(
		(el): el is HTMLElement => el != null
	);
	bindInput(elements, animSpriteLayer, Animation as unknown as { history: unknown }, (data: Record<string, unknown>) => {
		data.type = 'inspector-layer-change';
		data.motion = animSpriteLayer.motion;
		data.direction = Animation.direction;
	});

	const el = document.getElementById('animSpriteLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	const refreshLocalizedItems = () => {
		const getNames = (id: string, values: string[]) => {
			const options = getOptions(id);
			return values.map((value) => ({ name: options?.[value]?.name || value, value }));
		};
		elBlend.value?.loadItems(
			getNames('animSpriteLayer-blend', ['normal', 'additive', 'subtract'])
		);
		elLight.value?.loadItems(getNames('animSpriteLayer-light', ['raw', 'global', 'anchor']));
	};
	window.addEventListener('localize', refreshLocalizedItems);
	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
	onBeforeUnmount(() => window.removeEventListener('localize', refreshLocalizedItems));
	sync();
});
</script>
