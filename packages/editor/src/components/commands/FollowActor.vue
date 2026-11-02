<template>
	<WindowFrame id="followActor" :ref="controlRef('followActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.followActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.followActor-actor.label') }}</div>
			<CustomBox
				id="followActor-actor"
				:ref="controlRef('followActor-actor')"
				v-tip="t('components.followActor-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.followActor-target.label') }}</div>
			<CustomBox
				id="followActor-target"
				:ref="controlRef('followActor-target')"
				v-tip="t('components.followActor-target.tip')"
				type="actor"
				v-model="form.target"
			/>
			<div class="text">{{ t('components.followActor-mode.label') }}</div>
			<SelectBox
				:label="t('components.followActor-mode.label')"
				id="followActor-mode"
				v-tip="t('components.followActor-mode.tip')"
				:ref="controlRef('followActor-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.followActor-minDist.label') }}</div>
			<NumberVar
				id="followActor-minDist"
				:ref="controlRef('followActor-minDist')"
				v-tip="t('components.followActor-minDist.tip')"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
				v-model="form.minDist"
			/>
			<div class="text">{{ t('components.followActor-maxDist.label') }}</div>
			<NumberVar
				id="followActor-maxDist"
				:ref="controlRef('followActor-maxDist')"
				v-tip="t('components.followActor-maxDist.tip')"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
				v-model="form.maxDist"
			/>
			<div class="text">{{ t('components.followActor-offset.label') }}</div>
			<NumberBox
				:label="t('components.followActor-offset.label')"
				id="followActor-offset"
				v-tip="t('components.followActor-offset.tip')"
				:ref="controlRef('followActor-offset')"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
				v-model="offset"
			/>
			<div class="text">{{ t('components.followActor-vertDist.label') }}</div>
			<NumberBox
				:label="t('components.followActor-vertDist.label')"
				id="followActor-vertDist"
				v-tip="t('components.followActor-vertDist.tip')"
				:ref="controlRef('followActor-vertDist')"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="vertDist"
			/>
			<div class="text">{{ t('components.followActor-bufferDist.label') }}</div>
			<NumberBox
				:label="t('components.followActor-bufferDist.label')"
				id="followActor-bufferDist"
				:ref="controlRef('followActor-bufferDist')"
				v-tip="t('components.followActor-bufferDist.tip')"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="bufferDist"
			/>
			<div class="text">{{ t('components.followActor-navigate.label') }}</div>
			<SelectBox
				:label="t('components.followActor-navigate.label')"
				id="followActor-navigate"
				v-tip="t('components.followActor-navigate.tip')"
				:ref="controlRef('followActor-navigate')"
				v-model="form.navigate"
			/>
			<div class="text">{{ t('components.followActor-bypass.label') }}</div>
			<SelectBox
				:label="t('components.followActor-bypass.label')"
				id="followActor-bypass"
				v-tip="t('components.followActor-bypass.tip')"
				:ref="controlRef('followActor-bypass')"
				v-model="form.bypass"
			/>
			<div class="text">{{ t('components.followActor-once.label') }}</div>
			<SelectBox
				:label="t('components.followActor-once.label')"
				id="followActor-once"
				v-tip="t('components.followActor-once.tip')"
				:ref="controlRef('followActor-once')"
				v-model="form.once"
			/>
			<div class="text">{{ t('components.followActor-wait.label') }}</div>
			<SelectBox
				:label="t('components.followActor-wait.label')"
				id="followActor-wait"
				:ref="controlRef('followActor-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFollowActorCommandSchema } from '@app/composables/commands/useFollowActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'followActor'
	| 'followActor-actor'
	| 'followActor-bufferDist'
	| 'followActor-bypass'
	| 'followActor-maxDist'
	| 'followActor-minDist'
	| 'followActor-mode'
	| 'followActor-navigate'
	| 'followActor-offset'
	| 'followActor-once'
	| 'followActor-target'
	| 'followActor-vertDist'
	| 'followActor-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useFollowActorCommandSchema();

const offset = computed({
	get: () => form.offset as number | string,
	set: (value) => {
		form.offset = value;
	}
});
const vertDist = computed({
	get: () => form.vertDist as number | string,
	set: (value) => {
		form.vertDist = value;
	}
});
const bufferDist = computed({
	get: () => form.bufferDist as number | string,
	set: (value) => {
		form.bufferDist = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'followActor-mode',
		['circle', 'rectangle'],
		(items) => controls['followActor-mode']?.loadItems?.(items),
		{
			circle: 'command.followActor.mode.circle',
			rectangle: 'command.followActor.mode.rectangle'
		}
	);
	controls['followActor-mode']?.enableHiddenMode?.();
	controls['followActor-mode']?.relate?.([
		{ case: 'circle', targets: [controlRoot(controls['followActor-offset'])] },
		{ case: 'rectangle', targets: [controlRoot(controls['followActor-vertDist'])] }
	]);
	useLocalizedOptions('followActor-navigate', [true, false], (items) =>
		controls['followActor-navigate']?.loadItems?.(items)
	);
	controls['followActor-navigate']?.enableHiddenMode?.();
	controls['followActor-navigate']?.relate?.([
		{ case: true, targets: [controlRoot(controls['followActor-bypass'])] }
	]);
	useLocalizedOptions('followActor-bypass', [true, false], (items) =>
		controls['followActor-bypass']?.loadItems?.(items)
	);
	useLocalizedOptions('followActor-once', [true, false], (items) =>
		controls['followActor-once']?.loadItems?.(items)
	);
	controls['followActor-once']?.enableHiddenMode?.();
	controls['followActor-once']?.relate?.([
		{ case: true, targets: [controlRoot(controls['followActor-wait'])] }
	]);
	useLocalizedOptions('followActor-wait', [true, false], (items) =>
		controls['followActor-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#followActor {
	width: 324px;
	height: 338px;
}

#followActor-confirm {
	right: 108px;
	bottom: 10px;
}

#followActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
