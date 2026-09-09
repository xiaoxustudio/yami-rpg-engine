<template>
	<WindowFrame id="showText" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.showText.title') }}
				<div class="close" /></TitleBar
		></template>

		<CustomBox id="showText-target" v-focus type="actor" v-model="form.target" />
		<TextBox id="showText-parameters" v-model="parameters" />
		<TextArea
			id="showText-content"
			v-focus
			menu="tag-local-var tag-global-var tag-localization"
			v-model="content"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShowTextCommandSchema } from '@app/composables/commands/useShowTextCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, save } = useShowTextCommandSchema();

const parameters = computed({
	get: () => form.parameters as string,
	set: (value) => {
		form.parameters = value;
	}
});

const content = computed({
	get: () => form.content as string,
	set: (value) => {
		form.content = value;
	}
});

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#showText {
	width: 720px;
	height: 268px;
}

#showText-target {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 200px;
}

#showText-parameters {
	position: absolute;
	left: 220px;
	top: 10px;
	width: 490px;
	font-family: var(--font-family-mono);
}

#showText-content {
	position: absolute;
	left: 10px;
	top: 40px;
	width: 700px;
	height: 160px;
	background-color: var(--input-background);
}

#showText-confirm {
	right: 108px;
	bottom: 10px;
}

#showText-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
