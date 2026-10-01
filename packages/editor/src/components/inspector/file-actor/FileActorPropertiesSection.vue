<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileActor-general-grid">
			<div class="text">{{ t('components.fileActor-portrait.label') || 'Portrait' }}</div>
			<CustomBox
				id="fileActor-portrait"
				v-tip="t('components.fileActor-portrait.tip')"
				type="file"
				filter="image"
				:model-value="form.portrait"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileActor-clip"
				v-tip="t('components.fileActor-clip.tip')"
				type="clip"
				image="fileActor-portrait"
				:model-value="form.clip"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-animationId.label') || 'Animation' }}</div>
			<CustomBox
				id="fileActor-animationId"
				v-tip="t('components.fileActor-animationId.tip')"
				type="file"
				filter="animation"
				:model-value="form.animationId"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ t('components.fileActor-idleMotion.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-idleMotion.label')"
				id="fileActor-idleMotion"
				v-tip="t('components.fileActor-idleMotion.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-idleMotion')"
				v-model="form.idleMotion"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-moveMotion.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-moveMotion.label')"
				id="fileActor-moveMotion"
				v-tip="t('components.fileActor-moveMotion.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-moveMotion')"
				v-model="form.moveMotion"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-rotatable.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-rotatable.label')"
				id="fileActor-rotatable"
				v-tip="t('components.fileActor-rotatable.tip')"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-passage.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-passage.label')"
				id="fileActor-passage"
				v-tip="t('components.fileActor-passage.tip')"
				ref="elPassage"
				v-model="form.passage"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-speed.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-speed.label')"
				id="fileActor-speed"
				v-tip="t('components.fileActor-speed.tip')"
				v-model="form.speed"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-shape.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-shape.label')"
				id="fileActor-shape"
				v-tip="t('components.fileActor-shape.tip')"
				ref="elShape"
				v-model="form.shape"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-size.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-size.label')"
				id="fileActor-size"
				v-tip="t('components.fileActor-size.tip')"
				v-model="form.size"
				min="0"
				max="16"
				step="0.1"
				decimals="4"
				unit="t"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-weight.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-weight.label')"
				id="fileActor-weight"
				v-tip="t('components.fileActor-weight.tip')"
				v-model="form.weight"
				min="0"
				max="8"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-immovable.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-immovable.label')"
				id="fileActor-immovable"
				v-tip="t('components.fileActor-immovable.tip')"
				ref="elImmovable"
				v-model="form.immovable"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-scale.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-scale.label')"
				id="fileActor-scale"
				v-tip="t('components.fileActor-scale.tip')"
				v-model="form.scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-priority.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-priority.label')"
				id="fileActor-priority"
				v-tip="t('components.fileActor-priority.tip')"
				v-model="form.priority"
				min="-512"
				max="512"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-inherit.label') }}</div>
			<CustomBox
				id="fileActor-inherit"
				v-tip="t('components.fileActor-inherit.tip')"
				type="file"
				filter="actor"
				:model-value="form.inherit"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { fileActorContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(fileActorContextKey)!;

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileActor?.animationIdWrite?.({ value });
};

const elRotatable = ref<InstanceType<typeof SelectBox> | null>(null);
const elPassage = ref<InstanceType<typeof SelectBox> | null>(null);
const elShape = ref<InstanceType<typeof SelectBox> | null>(null);
const elImmovable = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	elRotatable.value?.loadItems([
		{
			name: t('components.fileActor-rotatable.options.true.name'),
			tip: t('components.fileActor-rotatable.options.true.tip'),
			value: true
		},
		{
			name: t('components.fileActor-rotatable.options.false.name'),
			tip: t('components.fileActor-rotatable.options.false.tip'),
			value: false
		}
	]);

	elPassage.value?.loadItems([
		{
			name: t('components.fileActor-passage.options.land.name'),
			tip: t('components.fileActor-passage.options.land.tip'),
			value: 'land'
		},
		{
			name: t('components.fileActor-passage.options.water.name'),
			tip: t('components.fileActor-passage.options.water.tip'),
			value: 'water'
		},
		{
			name: t('components.fileActor-passage.options.unrestricted.name'),
			tip: t('components.fileActor-passage.options.unrestricted.tip'),
			value: 'unrestricted'
		}
	]);

	elShape.value?.loadItems([
		{
			name: t('components.fileActor-shape.options.square.name'),
			tip: t('components.fileActor-shape.options.square.tip'),
			value: 'square'
		},
		{
			name: t('components.fileActor-shape.options.circle.name'),
			tip: t('components.fileActor-shape.options.circle.tip'),
			value: 'circle'
		}
	]);

	elImmovable.value?.loadItems([
		{
			name: t('components.fileActor-immovable.options.true.name'),
			tip: t('components.fileActor-immovable.options.true.tip'),
			value: true
		},
		{
			name: t('components.fileActor-immovable.options.false.name'),
			tip: t('components.fileActor-immovable.options.false.tip'),
			value: false
		}
	]);
});
</script>
