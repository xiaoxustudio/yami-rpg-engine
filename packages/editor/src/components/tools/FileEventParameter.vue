<template>
	<WindowFrame id="fileEvent-parameter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileEvent-parameter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileEvent-parameter-type.label') }}</div>
			<SelectBox
				:label="t('components.fileEvent-parameter-type.label')"
				id="fileEvent-parameter-type"
				v-tip="t('components.fileEvent-parameter-type.tip')"
				:ref="controlRef('fileEvent-parameter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.fileEvent-parameter-key.label') }}</div>
			<TextBox
				:label="t('components.fileEvent-parameter-key.label')"
				id="fileEvent-parameter-key"
				v-tip="t('components.fileEvent-parameter-key.tip')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.fileEvent-parameter-note.label') }}</div>
			<TextArea
				:label="t('components.fileEvent-parameter-note.label')"
				id="fileEvent-parameter-note"
				v-tip="t('components.fileEvent-parameter-note.tip')"
				v-model="form.note"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileEventParameterForm } from '@app/inspector/file-event-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideFileEventParameterBridge,
	resetFileEventParameterBridge,
	type FileEventParameterBridge
} from '@app/composables/file-event-parameter-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'fileEvent-parameter-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = fileEventParameterForm;

const onConfirm = () => {
	Inspector?.fileEvent?.parameters?.save?.();
};

/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */
const bridgeApi: FileEventParameterBridge = {
	loadTypeItems: (items) => {
		controls['fileEvent-parameter-type']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideFileEventParameterBridge(bridgeApi);
	onUnmounted(() => resetFileEventParameterBridge(bridgeApi));
});
</script>

<style>
#fileEvent-parameter {
	width: 324px;
	height: 218px;
}

#fileEvent-parameter-note {
	height: 92px;
}

#fileEvent-parameter-confirm {
	right: 108px;
	bottom: 10px;
}

#fileEvent-parameter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
