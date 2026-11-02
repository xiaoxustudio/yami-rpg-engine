<template>
	<WindowFrame id="setPartyMember" :ref="controlRef('setPartyMember')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPartyMember.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPartyMember-operation.label') }}</div>
			<SelectBox
				:label="t('components.setPartyMember-operation.label')"
				id="setPartyMember-operation"
				v-tip="t('components.setPartyMember-operation.tip')"
				:ref="controlRef('setPartyMember-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setPartyMember-actor.label') }}</div>
			<CustomBox
				id="setPartyMember-actor"
				:ref="controlRef('setPartyMember-actor')"
				v-tip="t('components.setPartyMember-actor.tip')"
				type="actor"
				v-model="form.actor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setPartyMember' | 'setPartyMember-actor' | 'setPartyMember-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetPartyMemberCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setPartyMember-operation',
		['add', 'remove'],
		(items) => controls['setPartyMember-operation']?.loadItems?.(items),
		{ add: 'command.setPartyMember.add', remove: 'command.setPartyMember.remove' }
	);
});
</script>

<style>
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
