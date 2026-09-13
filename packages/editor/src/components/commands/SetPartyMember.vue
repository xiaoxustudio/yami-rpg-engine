<template>
	<WindowFrame id="setPartyMember"
				:ref="registryRef(fieldEls, 'setPartyMember')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPartyMember.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPartyMember-operation.label') }}</div>
			<SelectBox id="setPartyMember-operation"
				v-tip="t('components.setPartyMember-operation.tip')"
				:ref="registryRef(fieldEls, 'setPartyMember-operation')" v-focus v-model="form.operation" />
			<div class="text">{{ t('components.setPartyMember-actor.label') }}</div>
			<CustomBox id="setPartyMember-actor"
				:ref="registryRef(fieldEls, 'setPartyMember-actor')"
				v-tip="t('components.setPartyMember-actor.tip')" type="actor" v-model="form.actor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
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
	useLocalizedOptions('setPartyMember-operation', ['add', 'remove'], (items) =>
		fieldEls.get('setPartyMember-operation')?.loadItems?.(items),
		{ 'add': 'command.setPartyMember.add', 'remove': 'command.setPartyMember.remove' }
	);
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
