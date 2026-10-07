<template>
	<!-- Open设置窗口 -->
	<WindowFrame id="setting" :ref="registryRef(serviceEls, 'setting')" @confirm="onConfirm">
		<template #title
			><TitleBar id="setting-title"
				>{{ t('components.setting.title') }}
				<div class="maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div class="grid-box" id="setting-grid">
			<div class="text setting-title" id="setting-title-server">
				{{ t('components.setting-title-server.content') }}
			</div>
			<div class="text">{{ t('components.setting-server-port.label') }}</div>
			<NumberBox
				:label="t('components.setting-server-port.label')"
				id="setting-server-port"
				v-tip="t('components.setting-server-port.tip')"
				min="0"
				max="65535"
			/>
			<div class="text">{{ t('components.setting-server-auto.label') }}</div>
			<CheckBox
				id="setting-server-auto"
				v-tip="t('components.setting-server-auto.tip')"
				class="standard"
			/>
			<div class="text setting-title" id="setting-title-apkbuild">
				{{ t('components.setting-title-apkbuild.content') }}
			</div>
			<div class="text">{{ t('components.setting-apkbuild-outputDir.label') }}</div>
			<TextBox
				:label="t('components.setting-apkbuild-outputDir.label')"
				id="setting-apkbuild-outputDir"
				v-tip="t('components.setting-apkbuild-outputDir.tip')"
			/>
			<div class="text">{{ t('components.setting-apkbuild-newApkPath.label') }}</div>
			<TextBox
				:label="t('components.setting-apkbuild-newApkPath.label')"
				id="setting-apkbuild-newApkPath"
				v-tip="t('components.setting-apkbuild-newApkPath.tip')"
			/>
			<div class="text">{{ t('components.setting-apkbuild-apktoolPath.label') }}</div>
			<TextBox
				:label="t('components.setting-apkbuild-apktoolPath.label')"
				id="setting-apkbuild-apktoolPath"
				v-tip="t('components.setting-apkbuild-apktoolPath.tip')"
			/>
			<div class="text setting-title" id="setting-title-signed">
				{{ t('components.setting-title-signed.content') }}
			</div>
			<div class="text">{{ t('components.setting-signed-jksPath.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-jksPath.label')"
				id="setting-signed-jksPath"
				v-tip="t('components.setting-signed-jksPath.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-keyStorePassword.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-keyStorePassword.label')"
				id="setting-signed-keyStorePassword"
				v-tip="t('components.setting-signed-keyStorePassword.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-keyAlias.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-keyAlias.label')"
				id="setting-signed-keyAlias"
				v-tip="t('components.setting-signed-keyAlias.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-keyPassword.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-keyPassword.label')"
				id="setting-signed-keyPassword"
				v-tip="t('components.setting-signed-keyPassword.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-apksignerPath.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-apksignerPath.label')"
				id="setting-signed-apksignerPath"
				v-tip="t('components.setting-signed-apksignerPath.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-zipalignPath.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-zipalignPath.label')"
				id="setting-signed-zipalignPath"
				v-tip="t('components.setting-signed-zipalignPath.tip')"
			/>
			<div class="text">{{ t('components.setting-signed-signedApkPath.label') }}</div>
			<TextBox
				:label="t('components.setting-signed-signedApkPath.label')"
				id="setting-signed-signedApkPath"
				v-tip="t('components.setting-signed-signedApkPath.tip')"
			/>
			<div class="text setting-title" id="setting-title-other">
				{{ t('components.setting-title-other.content') }}
			</div>
			<div class="text">
				{{ t('components.setting-other-copyAsTextKeepEmptyLine.label') }}
			</div>
			<CheckBox
				id="setting-other-copyAsTextKeepEmptyLine"
				v-tip="t('components.setting-other-copyAsTextKeepEmptyLine.tip')"
				class="standard"
			/>
			<div class="text">
				{{ t('components.setting-other-browserSearchHistoryLimit.label') }}
			</div>
			<SelectBox
				:label="t('components.setting-other-browserSearchHistoryLimit.label')"
				id="setting-other-browserSearchHistoryLimit"
				v-tip="t('components.setting-other-browserSearchHistoryLimit.tip')"
			/>
			<div class="text setting-title" id="setting-title-recent"></div>
			<div class="text" id="setting-recent-statsMode-label" />
			<SelectBox id="setting-recent-statsMode" />
			<div class="text setting-title" id="setting-title-github">
				{{ t('components.setting-title-github.content') }}
			</div>
			<div class="text">{{ t('components.setting-github-accelerationNode.label') }}</div>
			<SelectBox
				:label="t('components.setting-github-accelerationNode.label')"
				id="setting-github-accelerationNode"
				v-tip="t('components.setting-github-accelerationNode.tip')"
			/>
			<div class="text setting-title" id="setting-title-update"></div>
			<div class="text" id="setting-update-checkOnStart-label" />
			<CheckBox id="setting-update-checkOnStart" class="standard" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { Window } from '@app/tools/window-object.ts';
import { onMounted } from 'vue';
import { serviceEls } from '@app/services/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const onConfirm = () => {
	Window.close?.('setting');
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setting {
	width: 520px;
	height: 700px;
}

#setting-cancel {
	right: 10px;
	bottom: 10px;
}

#setting-confirm {
	right: 108px;
	bottom: 10px;
}
</style>
