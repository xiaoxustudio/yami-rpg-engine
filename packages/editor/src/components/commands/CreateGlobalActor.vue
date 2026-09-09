<template>
	<WindowFrame id="createGlobalActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox
				id="createGlobalActor-actorId"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">Team</div>
			<SelectBox id="createGlobalActor-teamId" v-model="form.teamId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#createGlobalActor')?.on?.('open', () => {
		$('#createGlobalActor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
