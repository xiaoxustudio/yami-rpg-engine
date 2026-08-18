<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.animParticleFrame-properties-grid.label') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animParticleFrame-properties-grid">
			<div class="text">{{ t('components.animParticleFrame-position-box.label') || 'Position' }}</div>
			<div
				id="animParticleFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-x"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-y"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animParticleFrame-rotation-box.label') || 'Rotation' }}</div>
			<div
				id="animParticleFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-rotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animParticleFrame-scale-box.label') || 'Scale' }}</div>
			<div
				id="animParticleFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-scaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-scaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animParticleFrame-opacity-box.label') || 'Opacity' }}</div>
			<div
				id="animParticleFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animParticleFrame-scale.label') || 'Particle Scale' }}</div
			><NumberBox
				id="animParticleFrame-scale"
				v-model="form.scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.animParticleFrame-speed.label') || 'Speed' }}</div
			><NumberBox
				id="animParticleFrame-speed"
				v-model="form.speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useAnimParticleFramePage } from '@app/composables/useAnimParticleFramePage';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimParticleFramePage();

onMounted(() => {
	const editor = Inspector.animParticleFrame;
	if (!editor) return;

	const el = document.getElementById('animParticleFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elements = document.querySelectorAll(
		'#animParticleFrame-x, #animParticleFrame-y, #animParticleFrame-rotation, #animParticleFrame-scaleX, #animParticleFrame-scaleY, #animParticleFrame-opacity, #animParticleFrame-scale, #animParticleFrame-speed'
	);
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.inputFocus));
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(editor, Animation, (data: Record<string, unknown>) => {
				data.type = 'inspector-frame-change';
				data.motion = editor.motion;
				data.direction = Animation.direction;
			}))
		);
	}

	sync();
});
</script>
