<template>
	<WindowFrame id="setLanguage" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setLanguage.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Language</div><SelectBox id="setLanguage-language" v-model="form.language" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useSetLanguageCommandSchema } from '@app/composables/commands/useSetLanguageCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetLanguageCommandSchema();

const onConfirm = () => {
	save();
};

</script>
