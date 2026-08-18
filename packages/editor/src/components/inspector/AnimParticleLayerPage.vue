<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.animParticleLayer-properties-grid.label') || 'Particle Layer' }}</DetailSummary>
		<div class="detail-grid" id="animParticleLayer-properties-grid">
			<div class="text">{{ t('components.animParticleLayer-particleId.label') || 'Particle' }}</div
			><CustomBox
				id="animParticleLayer-particleId"
				type="file"
				filter="particle"
				:model-value="form.particleId"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.animParticleLayer-position.label') || 'Position' }}</div
			><SelectBox id="animParticleLayer-position" v-model="form.position" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.animParticleLayer-angle.label') || 'Angle' }}</div><SelectBox id="animParticleLayer-angle" v-model="form.angle" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.animParticleLayer-order.label') || 'Order' }}</div><SelectBox id="animParticleLayer-order" v-model="form.order" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useAnimParticleLayerPage } from '@app/composables/useAnimParticleLayerPage';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimParticleLayerPage();

onMounted(() => {
	const editor = Inspector.animParticleLayer;
	if (!editor) return;

	const el = document.getElementById('animParticleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elPosition = document.getElementById('animParticleLayer-position') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elPosition?.loadItems) {
		elPosition.loadItems([
			{ name: 'Absolute', value: 'absolute' },
			{ name: 'Relative', value: 'relative' }
		]);
	}

	const elAngle = document.getElementById('animParticleLayer-angle') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elAngle?.loadItems) {
		elAngle.loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);
	}

	const elOrder = document.getElementById('animParticleLayer-order') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elOrder?.loadItems) {
		elOrder.loadItems([
			{ name: 'Behind Sprites', value: 'before' },
			{ name: 'Front of Sprites', value: 'after' }
		]);
	}

	const elements = document.querySelectorAll(
		'#animParticleLayer-particleId, #animParticleLayer-position, #animParticleLayer-angle, #animParticleLayer-order'
	);
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.inputFocus));
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(editor, Animation, (data: Record<string, unknown>) => {
				data.type = 'inspector-layer-change';
				data.motion = editor.motion;
				data.direction = Animation.direction;
			}))
		);
	}

	sync();
});
</script>
