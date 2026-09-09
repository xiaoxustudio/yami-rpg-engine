<template>
	<WindowFrame id="setPartyMember" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPartyMember.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="setPartyMember-operation" v-focus v-model="form.operation" />
			<div class="text">Global Actor</div>
			<CustomBox id="setPartyMember-actor" type="actor" v-model="form.actor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetPartyMemberCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setPartyMember-operation')?.loadItems?.([
		{ name: t('command.setPartyMember.add') || 'Add', value: 'add' },
		{ name: t('command.setPartyMember.remove') || 'Remove', value: 'remove' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setPartyMember {
	width: 324px;
	height: 122px;
}

#setPartyMember-confirm {
	right: 108px;
	bottom: 10px;
}

#setPartyMember-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
