<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneActor-general-grid">
			<div class="text">{{ t('components.sceneActor-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.sceneActor-name.label') || 'Name'"
				id="sceneActor-name"
				:ref="registryRef(inspectorEls, 'sceneActor-name')"
				v-tip="t('components.sceneActor-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneActor-type.label') || 'Type' }}</div>
			<SelectBox
				:label="t('components.sceneActor-type.label') || 'Type'"
				ref="elType"
				id="sceneActor-type"
				v-tip="t('components.sceneActor-type.tip')"
				v-model="form.type"
				@input="onParamInput"
				@write="onTypeWrite"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-actorId.label') || 'Actor' }}</div>
			<CustomBox
				id="sceneActor-actorId"
				:ref="registryRef(inspectorEls, 'sceneActor-actorId')"
				v-tip="t('components.sceneActor-actorId.tip')"
				:model-value="form.actorId"
				type="file"
				filter="actor"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.sceneActor-teamId.label') || 'Team' }}</div>
			<SelectBox
				:label="t('components.sceneActor-teamId.label') || 'Team'"
				id="sceneActor-teamId"
				v-tip="t('components.sceneActor-teamId.tip')"
				:ref="registryRef(inspectorEls, 'sceneActor-teamId')"
				v-model="form.teamId"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.sceneActor-x.label') || 'X'"
				id="sceneActor-x"
				:ref="registryRef(inspectorEls, 'sceneActor-x')"
				v-tip="t('components.sceneActor-x.tip')"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneActor-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.sceneActor-y.label') || 'Y'"
				id="sceneActor-y"
				:ref="registryRef(inspectorEls, 'sceneActor-y')"
				v-tip="t('components.sceneActor-y.tip')"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneActor-angle-box.label') || 'Angle' }}</div>
			<div
				class="flex-box"
				id="sceneActor-angle-box"
				v-tip="t('components.sceneActor-angle-box.tip')"
			>
				<SliderBox
					ref="elAngleSlider"
					id="sceneActor-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneActor-angle-box.label') || 'Angle'"
					ref="elAngle"
					id="sceneActor-angle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneActor-scale-box.label') || 'Scale' }}</div>
			<div
				class="flex-box"
				id="sceneActor-scale-box"
				v-tip="t('components.sceneActor-scale-box.tip')"
			>
				<SliderBox
					ref="elScaleSlider"
					id="sceneActor-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneActor-scale-box.label') || 'Scale'"
					ref="elScale"
					id="sceneActor-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { sceneActorContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneActorContextKey)!;

const onTypeWrite = (value: unknown) => {
	Inspector?.sceneActor?.typeWrite?.({ value });
};

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elScale = ref<InstanceType<typeof NumberBox> | null>(null);

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	const el = input?.root ?? null;
	if (!el) return;
	slider?.synchronize(
		el as HTMLElement & {
			write(value: number | string): void;
			input: HTMLInputElement;
		}
	);
};

onMounted(() => {
	registerElement(inspectorEls, 'sceneActor-type', elType.value);
	registerElement(inspectorEls, 'sceneActor-angle', elAngle.value);
	registerElement(inspectorEls, 'sceneActor-scale', elScale.value);
	registerElement(inspectorEls, 'sceneActor-angle-slider', elAngleSlider.value);
	registerElement(inspectorEls, 'sceneActor-scale-slider', elScaleSlider.value);
	elType.value?.loadItems([
		{
			name: t('components.sceneActor-type.options.local.name'),
			tip: t('components.sceneActor-type.options.local.tip'),
			value: 'local'
		},
		{
			name: t('components.sceneActor-type.options.global.name'),
			tip: t('components.sceneActor-type.options.global.tip'),
			value: 'global'
		}
	]);
	synchronize(elAngleSlider.value, elAngle.value);
	synchronize(elScaleSlider.value, elScale.value);
});
</script>
