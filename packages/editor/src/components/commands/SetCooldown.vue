<template>
	<WindowFrame id="setCooldown" :ref="controlRef('setCooldown')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setCooldown.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setCooldown-actor.label') }}</div>
			<CustomBox
				id="setCooldown-actor"
				:ref="controlRef('setCooldown-actor')"
				v-tip="t('components.setCooldown-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setCooldown-operation.label') }}</div>
			<SelectBox
				:label="t('components.setCooldown-operation.label')"
				id="setCooldown-operation"
				v-tip="t('components.setCooldown-operation.tip')"
				:ref="controlRef('setCooldown-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setCooldown-key.label') }}</div>
			<SelectVar
				id="setCooldown-key"
				:ref="controlRef('setCooldown-key')"
				v-tip="t('components.setCooldown-key.tip')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setCooldown-cooldown.label') }}</div>
			<NumberVar
				id="setCooldown-cooldown"
				:ref="controlRef('setCooldown-cooldown')"
				v-tip="t('components.setCooldown-cooldown.tip')"
				min="1"
				max="3600000"
				unit="ms"
				v-model="form.cooldown"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideSetCooldownBridge,
	resetSetCooldownBridge,
	type SetCooldownBridge
} from '@app/composables/set-cooldown-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setCooldown-actor'
	| 'setCooldown-cooldown'
	| 'setCooldown-key'
	| 'setCooldown-operation'
	| 'setCooldown';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetCooldownCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */
const bridgeApi: SetCooldownBridge = {
	loadItems: (items) => {
		controls['setCooldown-key']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideSetCooldownBridge(bridgeApi);
	onUnmounted(() => resetSetCooldownBridge(bridgeApi));
	useLocalizedOptions(
		'setCooldown-operation',
		['set', 'increase', 'decrease'],
		(items) => controls['setCooldown-operation']?.loadItems?.(items),
		{
			set: 'command.setCooldown.set',
			increase: 'command.setCooldown.increase',
			decrease: 'command.setCooldown.decrease'
		}
	);
});
</script>

<style>
#setCooldown {
	width: 324px;
	height: 170px;
}

#setCooldown-confirm {
	right: 108px;
	bottom: 10px;
}

#setCooldown-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
