<template>
	<WindowFrame
		id="createActor"
		:ref="controlRef('createActor')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.createActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createActor-actorId.label') }}</div>
			<CustomBox
				id="createActor-actorId"
				:ref="controlRef('createActor-actorId')"
				v-tip="t('components.createActor-actorId.tip')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">{{ t('components.createActor-teamId.label') }}</div>
			<SelectBox
				:label="t('components.createActor-teamId.label')"
				id="createActor-teamId"
				v-tip="t('components.createActor-teamId.tip')"
				:ref="controlRef('createActor-teamId')"
				v-model="form.teamId"
			/>
			<div class="text">{{ t('components.createActor-position.label') }}</div>
			<CustomBox
				id="createActor-position"
				:ref="controlRef('createActor-position')"
				v-tip="t('components.createActor-position.tip')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.createActor-angle.label') }}</div>
			<NumberVar
				id="createActor-angle"
				:ref="controlRef('createActor-angle')"
				v-tip="t('components.createActor-angle.tip')"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateActorCommandSchema } from '@app/composables/commands/useCreateActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'createActor'
	| 'createActor-actorId'
	| 'createActor-angle'
	| 'createActor-position'
	| 'createActor-teamId';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useCreateActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['createActor-teamId']?.loadItems?.(Data.createTeamItems!());
};

onMounted(() => {});
</script>

<style>
#createActor {
	width: 324px;
	height: 170px;
}

#createActor-confirm {
	right: 108px;
	bottom: 10px;
}

#createActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
