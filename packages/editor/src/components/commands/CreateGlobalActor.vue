<template>
	<WindowFrame
		id="createGlobalActor"
		:ref="registryRef(fieldEls, 'createGlobalActor')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.createGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createGlobalActor-actorId.label') }}</div>
			<CustomBox
				id="createGlobalActor-actorId"
				:ref="registryRef(fieldEls, 'createGlobalActor-actorId')"
				v-tip="t('components.createGlobalActor-actorId.tip')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">{{ t('components.createGlobalActor-teamId.label') }}</div>
			<SelectBox
				:label="t('components.createGlobalActor-teamId.label')"
				id="createGlobalActor-teamId"
				v-tip="t('components.createGlobalActor-teamId.tip')"
				:ref="registryRef(fieldEls, 'createGlobalActor-teamId')"
				v-model="form.teamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCreateGlobalActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('createGlobalActor')?.on?.('open', () => {
		fieldEls.get('createGlobalActor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
});
</script>

<style>
#createGlobalActor {
	width: 324px;
	height: 122px;
}

#createGlobalActor-confirm {
	right: 108px;
	bottom: 10px;
}

#createGlobalActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
