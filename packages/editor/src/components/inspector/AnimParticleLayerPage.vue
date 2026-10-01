<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.animParticleLayer-properties-grid.label') || 'Particle Layer'
		}}</DetailSummary>
		<div class="detail-grid" id="animParticleLayer-properties-grid">
			<div class="text">
				{{ t('components.animParticleLayer-particleId.label') || 'Particle' }}
			</div>
			<CustomBox
				id="animParticleLayer-particleId"
				v-tip="t('components.animParticleLayer-particleId.tip')"
				ref="elParticleId"
				type="file"
				filter="particle"
				:model-value="form.particleId"
				@input="onParamInput"
			></CustomBox>
			<div class="text">
				{{ t('components.animParticleLayer-position.label') || 'Position' }}
			</div>
			<SelectBox
				:label="t('components.animParticleLayer-position.label') || 'Position'"
				id="animParticleLayer-position"
				v-tip="t('components.animParticleLayer-position.tip')"
				ref="elPosition"
				v-model="form.position"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.animParticleLayer-angle.label') || 'Angle' }}</div>
			<SelectBox
				:label="t('components.animParticleLayer-angle.label') || 'Angle'"
				id="animParticleLayer-angle"
				v-tip="t('components.animParticleLayer-angle.tip')"
				ref="elAngle"
				v-model="form.angle"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.animParticleLayer-order.label') || 'Order' }}</div>
			<SelectBox
				:label="t('components.animParticleLayer-order.label') || 'Order'"
				id="animParticleLayer-order"
				v-tip="t('components.animParticleLayer-order.tip')"
				ref="elOrder"
				v-model="form.order"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { useAnimParticleLayerPage } from '@app/composables/useAnimParticleLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimParticleLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elParticleId = ref<InstanceType<typeof CustomBox> | null>(null);
const elPosition = ref<InstanceType<typeof SelectBox> | null>(null);
const elAngle = ref<InstanceType<typeof SelectBox> | null>(null);
const elOrder = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	const editor = Inspector.animParticleLayer;
	if (!editor) return;

	const el = inspectorEls.get('animParticleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elPosition.value?.loadItems([
		{
			name: t('components.animParticleLayer-position.options.absolute.name'),
			tip: t('components.animParticleLayer-position.options.absolute.tip'),
			value: 'absolute'
		},
		{
			name: t('components.animParticleLayer-position.options.relative.name'),
			tip: t('components.animParticleLayer-position.options.relative.tip'),
			value: 'relative'
		}
	]);

	elAngle.value?.loadItems([
		{
			name: t('components.animParticleLayer-angle.options.default.name'),
			tip: t('components.animParticleLayer-angle.options.default.tip'),
			value: 'default'
		},
		{
			name: t('components.animParticleLayer-angle.options.inherit.name'),
			tip: t('components.animParticleLayer-angle.options.inherit.tip'),
			value: 'inherit'
		}
	]);

	elOrder.value?.loadItems([
		{ name: 'Behind Sprites', value: 'before' },
		{ name: 'Front of Sprites', value: 'after' }
	]);

	const elements = [
		elParticleId.value?.root,
		elPosition.value?.root,
		elAngle.value?.root,
		elOrder.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, Animation, (data: Record<string, unknown>) => {
		data.type = 'inspector-layer-change';
		data.motion = editor.motion;
		data.direction = Animation.direction;
	});

	sync();
});
</script>
