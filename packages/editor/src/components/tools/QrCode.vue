<template>
	<WindowFrame id="qr-code" no-buttons>
		<template #title
			><TitleBar
				>本地服务预览
				<div class="close"></div></TitleBar
		></template>

		<div class="box">
			<div class="box" id="qr-img-container">
				<img id="qr-code-img" :src="imgSrc" alt="QR code" />
			</div>
			<br />
			<div class="box" id="qr-code-content" ref="elContent">
				<div>IP：{{ url }}</div>
				<div>扫描二维码打开网页</div>
				<div style="color: red">PS：注意需在同一局域网下扫描二维码</div>
				<div style="color: red">如果内容没刷新，请Ctrl+S保存场景</div>
			</div>
		</div>
		<button
			id="qr-start-button"
			:ref="registryRef(serviceEls, 'qr-start-button')"
			name="start-qr-code"
		/>
		<button
			id="qr-close-button"
			:ref="registryRef(serviceEls, 'qr-close-button')"
			name="close-qr-code"
		/>
		<button
			id="qr-update-button"
			:ref="registryRef(serviceEls, 'qr-update-button')"
			name="update-qr-code"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { serviceEls } from '@app/services/element-registry';
import { registryRef, registerElement } from '@app/utils/element-registry';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';

const url = ref('');
const imgSrc = ref('');

const elContent = ref<HTMLElement | null>(null);

const update = (value: { url: string; img: string }): void => {
	url.value = value.url;
	imgSrc.value = value.img;
};

onMounted(() => {
	registerElement(serviceEls, 'qr-code-content', elContent.value);
	const el = elContent.value;
	if (!el) return;
	attachElementApi(el, { update });
});
</script>

<style>
#qr-code {
	width: 320px;
	height: 400px;
	border: 5px solid transparent;
	border-image-slice: 1;
}

#qr-code-img {
	width: 200px;
	height: 200px;
}

#qr-img-container {
	width: 100%;
	height: 220px;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
}

#qr-start-button {
	right: 206px;
	bottom: 10px;
}

#qr-close-button {
	right: 108px;
	bottom: 10px;
}

#qr-update-button {
	right: 10px;
	bottom: 10px;
}
</style>
