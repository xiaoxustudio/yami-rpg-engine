<template>
	<WindowFrame id="setSkill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Skill</div>
			<CustomBox id="setSkill-skill" v-focus type="skill" v-model="form.skill" />
			<div class="text">Operation</div>
			<SelectBox id="setSkill-operation" v-model="form.operation" />
			<div class="text">Cooldown</div>
			<NumberVar
				id="setSkill-cooldown"
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
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setSkill-operation')?.loadItems?.([
		{ name: 'Set Cooldown Time', value: 'set-cooldown' },
		{ name: 'Increase Cooldown Time', value: 'increase-cooldown' },
		{ name: 'Decrease Cooldown Time', value: 'decrease-cooldown' }
	]);
});
</script>
