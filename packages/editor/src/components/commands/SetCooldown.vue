<template>
	<WindowFrame id="setCooldown" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setCooldown.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setCooldown-actor"
				v-tip="t('components.setCooldown-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="setCooldown-operation"
				v-tip="t('components.setCooldown-operation.tip')"
				:ref="registryRef(fieldEls, 'setCooldown-operation')" v-model="form.operation" />
			<div class="text">Cooldown Key</div>
			<SelectVar id="setCooldown-key"
				v-tip="t('components.setCooldown-key.tip')" v-model="form.key" />
			<div class="text">Cooldown Time</div>
			<NumberVar
				id="setCooldown-cooldown"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetCooldownCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setCooldown-operation')?.loadItems?.([
		{ name: t('command.setCooldown.set') || 'Set', value: 'set' },
		{ name: t('command.setCooldown.increase') || 'Increase', value: 'increase' },
		{ name: t('command.setCooldown.decrease') || 'Decrease', value: 'decrease' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
