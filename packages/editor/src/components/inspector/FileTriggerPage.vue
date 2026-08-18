<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-general-grid">
			<div class="text">{{ local.getLabel('fileTrigger-selector') || 'Selector' }}</div><SelectBox id="fileTrigger-selector" v-model="form.selector" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitWalls') || 'On Hit Walls' }}</div
			><SelectBox id="fileTrigger-onHitWalls" v-model="form.onHitWalls" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitActors') || 'On Hit Actors' }}</div
			><SelectBox id="fileTrigger-onHitActors" v-model="form.onHitActors" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitCount') || 'Hit Count' }}</div
			><NumberBox id="fileTrigger-hitCount" v-model="form.hitCount" min="2" max="10000" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-type') || 'Shape' }}</div><SelectBox id="fileTrigger-shape-type" v-model="form.shapeType" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-width') || 'Width' }}</div
			><NumberBox
				id="fileTrigger-shape-width"
				v-model="form.shapeWidth"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-height') || 'Height' }}</div
			><NumberBox
				id="fileTrigger-shape-height"
				v-model="form.shapeHeight"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-anchor') || 'Anchor' }}</div
			><NumberBox
				id="fileTrigger-shape-anchor"
				v-model="form.shapeAnchor"
				min="-4"
				max="5"
				decimals="4" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-radius') || 'Radius' }}</div
			><NumberBox
				id="fileTrigger-shape-radius"
				v-model="form.shapeRadius"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-centralAngle') || 'Central Angle' }}</div
			><NumberBox
				id="fileTrigger-shape-centralAngle"
				v-model="form.shapeCentralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-speed') || 'Speed' }}</div
			><NumberBox
				id="fileTrigger-speed"
				v-model="form.speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-hitMode') || 'Hit Mode' }}</div><SelectBox id="fileTrigger-hitMode" v-model="form.hitMode" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitInterval') || 'Hit Interval' }}</div
			><NumberBox
				id="fileTrigger-hitInterval"
				v-model="form.hitInterval"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-initialDelay') || 'Initial Delay' }}</div
			><NumberBox
				id="fileTrigger-initialDelay"
				v-model="form.initialDelay"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-effectiveTime') || 'Effective Time' }}</div
			><NumberBox
				id="fileTrigger-effectiveTime"
				v-model="form.effectiveTime"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-duration') || 'Duration' }}</div
			><NumberBox
				id="fileTrigger-duration"
				v-model="form.duration"
				min="0"
				max="1000000000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-inherit') || 'Inherit' }}</div
			><CustomBox id="fileTrigger-inherit" :model-value="form.inherit" type="file" filter="trigger" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-animation-grid') || 'Animation' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-animation-grid">
			<div class="text">{{ local.getLabel('fileTrigger-animationId') || 'Animation' }}</div
			><CustomBox
				id="fileTrigger-animationId"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-motion') || 'Motion' }}</div><SelectBox id="fileTrigger-motion" v-model="form.motion" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-priority') || 'Priority' }}</div
			><NumberBox id="fileTrigger-priority" v-model="form.priority" min="-100" max="100" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-offsetY') || 'Offset Y' }}</div
			><NumberBox
				id="fileTrigger-offsetY"
				v-model="form.offsetY"
				min="-100"
				max="100"
				unit="px" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-rotatable') || 'Rotatable' }}</div><SelectBox id="fileTrigger-rotatable" v-model="form.rotatable" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileTrigger-events"
			class="inspector-list"
			filter="trigger"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileTrigger-scripts"
			class="inspector-list"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<ParameterPane id="fileTrigger-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useFileTriggerPage } from '@app/composables/useFileTriggerPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useFileTriggerPage();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileTrigger?.animationIdWrite?.({ value });
};
const onListChange = () => {
	Inspector?.fileTrigger?.listChange?.();
};

onMounted(() => {
	const editor = Inspector.fileTrigger;
	if (!editor) return;

	const el = document.getElementById('fileTrigger-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elSelector = document.getElementById('fileTrigger-selector') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elSelector?.loadItems) {
		elSelector.loadItems([
			{ name: 'Enemy', value: 'enemy' },
			{ name: 'Friend', value: 'friend' },
			{ name: 'Team Member', value: 'team' },
			{ name: 'Team Member Except Self', value: 'team-except-self' },
			{ name: 'Any Except Self', value: 'any-except-self' },
			{ name: 'Any', value: 'any' }
		]);
	}

	const elOnHitWalls = document.getElementById('fileTrigger-onHitWalls') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elOnHitWalls?.loadItems) {
		elOnHitWalls.loadItems([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' }
		]);
	}

	const elOnHitActors = document.getElementById('fileTrigger-onHitActors') as HTMLElement & { loadItems?: (items: unknown[]) => void; enableHiddenMode?: () => HTMLElement & { relate?: (entries: unknown) => void } } | null;
	if (elOnHitActors?.loadItems) {
		elOnHitActors.loadItems([
			{ name: 'Penetrate', value: 'penetrate' },
			{ name: 'Destroy', value: 'destroy' },
			{ name: 'Destroy After Multiple Hits', value: 'penetrate-destroy' }
		]);
	}
	if (elOnHitActors?.enableHiddenMode) {
		const hidden = elOnHitActors.enableHiddenMode();
		hidden.relate?.([{ case: 'penetrate-destroy', targets: [document.getElementById('fileTrigger-hitCount')] }]);
	}

	const elShapeType = document.getElementById('fileTrigger-shape-type') as HTMLElement & { loadItems?: (items: unknown[]) => void; enableHiddenMode?: () => HTMLElement & { relate?: (entries: unknown) => void } } | null;
	if (elShapeType?.loadItems) {
		elShapeType.loadItems([
			{ name: 'Rectangle', value: 'rectangle' },
			{ name: 'Circle', value: 'circle' },
			{ name: 'Sector', value: 'sector' }
		]);
	}
	if (elShapeType?.enableHiddenMode) {
		const hidden = elShapeType.enableHiddenMode();
		hidden.relate?.([
			{ case: 'rectangle', targets: [document.getElementById('fileTrigger-shape-width'), document.getElementById('fileTrigger-shape-height'), document.getElementById('fileTrigger-shape-anchor')] },
			{ case: 'circle', targets: [document.getElementById('fileTrigger-shape-radius')] },
			{ case: 'sector', targets: [document.getElementById('fileTrigger-shape-radius'), document.getElementById('fileTrigger-shape-centralAngle')] }
		]);
	}

	const elHitMode = document.getElementById('fileTrigger-hitMode') as HTMLElement & { loadItems?: (items: unknown[]) => void; enableHiddenMode?: () => HTMLElement & { relate?: (entries: unknown) => void } } | null;
	if (elHitMode?.loadItems) {
		elHitMode.loadItems([
			{ name: 'Once', value: 'once' },
			{ name: 'Once On Overlap', value: 'once-on-overlap' },
			{ name: 'Repeat', value: 'repeat' }
		]);
	}
	if (elHitMode?.enableHiddenMode) {
		const hidden = elHitMode.enableHiddenMode();
		hidden.relate?.([{ case: 'repeat', targets: [document.getElementById('fileTrigger-hitInterval')] }]);
	}

	const elRotatable = document.getElementById('fileTrigger-rotatable') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elRotatable?.loadItems) {
		elRotatable.loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
	}

	document.getElementById('fileTrigger-events')?.bind?.(new EventListInterface(editor));
	document.getElementById('fileTrigger-scripts')?.bind?.(new ScriptListInterface());
	document.getElementById('fileTrigger-parameter-pane')?.bind?.(document.getElementById('fileTrigger-scripts'));

	sync();
});
</script>
