<template>
	<WindowFrame id="setCooldown" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setCooldown.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setCooldown-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="setCooldown-operation" v-model="form.operation" />
			<div class="text">Cooldown Key</div>
			<SelectVar id="setCooldown-key" v-model="form.key" />
			<div class="text">Cooldown Time</div>
			<NumberVar
				id="setCooldown-cooldown"
				min="1"
				max="3600000"
				unit="ms"
				v-model="form.cooldown"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#setCooldown-operation')?.loadItems?.([
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
