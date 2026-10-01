<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileTrigger-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-general-grid">
			<div class="text">{{ t('components.fileTrigger-selector.label') || 'Selector' }}</div>
			<SelectBox
				:label="t('components.fileTrigger-selector.label') || 'Selector'"
				id="fileTrigger-selector"
				v-tip="t('components.fileTrigger-selector.tip')"
				ref="elSelector"
				v-model="form.selector"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-onHitWalls.label') || 'On Hit Walls' }}
			</div>
			<SelectBox
				:label="t('components.fileTrigger-onHitWalls.label') || 'On Hit Walls'"
				id="fileTrigger-onHitWalls"
				v-tip="t('components.fileTrigger-onHitWalls.tip')"
				ref="elOnHitWalls"
				v-model="form.onHitWalls"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-onHitActors.label') || 'On Hit Actors' }}
			</div>
			<SelectBox
				:label="t('components.fileTrigger-onHitActors.label') || 'On Hit Actors'"
				id="fileTrigger-onHitActors"
				v-tip="t('components.fileTrigger-onHitActors.tip')"
				ref="elOnHitActors"
				v-model="form.onHitActors"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-hitCount.label') || 'Hit Count' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-hitCount.label') || 'Hit Count'"
				id="fileTrigger-hitCount"
				v-tip="t('components.fileTrigger-hitCount.tip')"
				ref="elHitCount"
				v-model="form.hitCount"
				min="2"
				max="10000"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-shape-type.label') || 'Shape' }}</div>
			<SelectBox
				:label="t('components.fileTrigger-shape-type.label') || 'Shape'"
				id="fileTrigger-shape-type"
				v-tip="t('components.fileTrigger-shape-type.tip')"
				ref="elShapeType"
				v-model="form.shapeType"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-shape-width.label') || 'Width' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-shape-width.label') || 'Width'"
				id="fileTrigger-shape-width"
				v-tip="t('components.fileTrigger-shape-width.tip')"
				ref="elShapeWidth"
				v-model="form.shapeWidth"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-shape-height.label') || 'Height' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-shape-height.label') || 'Height'"
				id="fileTrigger-shape-height"
				v-tip="t('components.fileTrigger-shape-height.tip')"
				ref="elShapeHeight"
				v-model="form.shapeHeight"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-shape-anchor.label') || 'Anchor' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-shape-anchor.label') || 'Anchor'"
				id="fileTrigger-shape-anchor"
				v-tip="t('components.fileTrigger-shape-anchor.tip')"
				ref="elShapeAnchor"
				v-model="form.shapeAnchor"
				min="-4"
				max="5"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-shape-radius.label') || 'Radius' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-shape-radius.label') || 'Radius'"
				id="fileTrigger-shape-radius"
				v-tip="t('components.fileTrigger-shape-radius.tip')"
				ref="elShapeRadius"
				v-model="form.shapeRadius"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-shape-centralAngle.label') || 'Central Angle' }}
			</div>
			<NumberBox
				:label="t('components.fileTrigger-shape-centralAngle.label') || 'Central Angle'"
				id="fileTrigger-shape-centralAngle"
				v-tip="t('components.fileTrigger-shape-centralAngle.tip')"
				ref="elShapeCentralAngle"
				v-model="form.shapeCentralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-speed.label') || 'Speed' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-speed.label') || 'Speed'"
				id="fileTrigger-speed"
				v-tip="t('components.fileTrigger-speed.tip')"
				v-model="form.speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-hitMode.label') || 'Hit Mode' }}</div>
			<SelectBox
				:label="t('components.fileTrigger-hitMode.label') || 'Hit Mode'"
				id="fileTrigger-hitMode"
				v-tip="t('components.fileTrigger-hitMode.tip')"
				ref="elHitMode"
				v-model="form.hitMode"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-hitInterval.label') || 'Hit Interval' }}
			</div>
			<NumberBox
				:label="t('components.fileTrigger-hitInterval.label') || 'Hit Interval'"
				id="fileTrigger-hitInterval"
				v-tip="t('components.fileTrigger-hitInterval.tip')"
				ref="elHitInterval"
				v-model="form.hitInterval"
				min="0"
				max="10000"
				unit="ms"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-initialDelay.label') || 'Initial Delay' }}
			</div>
			<NumberBox
				:label="t('components.fileTrigger-initialDelay.label') || 'Initial Delay'"
				id="fileTrigger-initialDelay"
				v-tip="t('components.fileTrigger-initialDelay.tip')"
				v-model="form.initialDelay"
				min="0"
				max="10000"
				unit="ms"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTrigger-effectiveTime.label') || 'Effective Time' }}
			</div>
			<NumberBox
				:label="t('components.fileTrigger-effectiveTime.label') || 'Effective Time'"
				id="fileTrigger-effectiveTime"
				v-tip="t('components.fileTrigger-effectiveTime.tip')"
				v-model="form.effectiveTime"
				min="0"
				max="10000"
				unit="ms"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-duration.label') || 'Duration' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-duration.label') || 'Duration'"
				id="fileTrigger-duration"
				v-tip="t('components.fileTrigger-duration.tip')"
				v-model="form.duration"
				min="0"
				max="1000000000"
				unit="ms"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileTrigger-inherit"
				v-tip="t('components.fileTrigger-inherit.tip')"
				:model-value="form.inherit"
				type="file"
				filter="trigger"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { fileTriggerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(fileTriggerContextKey)!;

const elSelector = ref<InstanceType<typeof SelectBox> | null>(null);
const elOnHitWalls = ref<InstanceType<typeof SelectBox> | null>(null);
const elOnHitActors = ref<InstanceType<typeof SelectBox> | null>(null);
const elHitCount = ref<InstanceType<typeof NumberBox> | null>(null);
const elShapeType = ref<InstanceType<typeof SelectBox> | null>(null);
const elShapeWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elShapeHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elShapeAnchor = ref<InstanceType<typeof NumberBox> | null>(null);
const elShapeRadius = ref<InstanceType<typeof NumberBox> | null>(null);
const elShapeCentralAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elHitMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elHitInterval = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	elSelector.value?.loadItems([
		{
			name: t('components.fileTrigger-selector.options.enemy.name'),
			tip: t('components.fileTrigger-selector.options.enemy.tip'),
			value: 'enemy'
		},
		{
			name: t('components.fileTrigger-selector.options.friend.name'),
			tip: t('components.fileTrigger-selector.options.friend.tip'),
			value: 'friend'
		},
		{
			name: t('components.fileTrigger-selector.options.team.name'),
			tip: t('components.fileTrigger-selector.options.team.tip'),
			value: 'team'
		},
		{
			name: t('components.fileTrigger-selector.options.team-except-self.name'),
			tip: t('components.fileTrigger-selector.options.team-except-self.tip'),
			value: 'team-except-self'
		},
		{
			name: t('components.fileTrigger-selector.options.any-except-self.name'),
			tip: t('components.fileTrigger-selector.options.any-except-self.tip'),
			value: 'any-except-self'
		},
		{
			name: t('components.fileTrigger-selector.options.any.name'),
			tip: t('components.fileTrigger-selector.options.any.tip'),
			value: 'any'
		}
	]);

	elOnHitWalls.value?.loadItems([
		{
			name: t('components.fileTrigger-onHitWalls.options.penetrate.name'),
			tip: t('components.fileTrigger-onHitWalls.options.penetrate.tip'),
			value: 'penetrate'
		},
		{
			name: t('components.fileTrigger-onHitWalls.options.destroy.name'),
			tip: t('components.fileTrigger-onHitWalls.options.destroy.tip'),
			value: 'destroy'
		}
	]);

	elOnHitActors.value?.loadItems([
		{
			name: t('components.fileTrigger-onHitActors.options.penetrate.name'),
			tip: t('components.fileTrigger-onHitActors.options.penetrate.tip'),
			value: 'penetrate'
		},
		{
			name: t('components.fileTrigger-onHitActors.options.destroy.name'),
			tip: t('components.fileTrigger-onHitActors.options.destroy.tip'),
			value: 'destroy'
		},
		{
			name: t('components.fileTrigger-onHitActors.options.penetrate-destroy.name'),
			tip: t('components.fileTrigger-onHitActors.options.penetrate-destroy.tip'),
			value: 'penetrate-destroy'
		}
	]);
	if (elOnHitActors.value) {
		elOnHitActors.value.enableHiddenMode();
		elOnHitActors.value.relate([
			{
				case: 'penetrate-destroy',
				targets: [elHitCount.value?.root ?? null]
			}
		]);
	}

	elShapeType.value?.loadItems([
		{
			name: t('components.fileTrigger-shape-type.options.rectangle.name'),
			tip: t('components.fileTrigger-shape-type.options.rectangle.tip'),
			value: 'rectangle'
		},
		{
			name: t('components.fileTrigger-shape-type.options.circle.name'),
			tip: t('components.fileTrigger-shape-type.options.circle.tip'),
			value: 'circle'
		},
		{
			name: t('components.fileTrigger-shape-type.options.sector.name'),
			tip: t('components.fileTrigger-shape-type.options.sector.tip'),
			value: 'sector'
		}
	]);
	if (elShapeType.value) {
		elShapeType.value.enableHiddenMode();
		elShapeType.value.relate([
			{
				case: 'rectangle',
				targets: [
					elShapeWidth.value?.root ?? null,
					elShapeHeight.value?.root ?? null,
					elShapeAnchor.value?.root ?? null
				]
			},
			{ case: 'circle', targets: [elShapeRadius.value?.root ?? null] },
			{
				case: 'sector',
				targets: [
					elShapeRadius.value?.root ?? null,
					elShapeCentralAngle.value?.root ?? null
				]
			}
		]);
	}

	elHitMode.value?.loadItems([
		{
			name: t('components.fileTrigger-hitMode.options.once.name'),
			tip: t('components.fileTrigger-hitMode.options.once.tip'),
			value: 'once'
		},
		{
			name: t('components.fileTrigger-hitMode.options.once-on-overlap.name'),
			tip: t('components.fileTrigger-hitMode.options.once-on-overlap.tip'),
			value: 'once-on-overlap'
		},
		{
			name: t('components.fileTrigger-hitMode.options.repeat.name'),
			tip: t('components.fileTrigger-hitMode.options.repeat.tip'),
			value: 'repeat'
		}
	]);
	if (elHitMode.value) {
		elHitMode.value.enableHiddenMode();
		elHitMode.value.relate([{ case: 'repeat', targets: [elHitInterval.value?.root ?? null] }]);
	}
});
</script>
