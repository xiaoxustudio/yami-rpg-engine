import MarkdownIt from 'markdown-it';

export function markndownToHtml(markdown: string) {
	const clean = markdown.replace(/<!--[\s\S]*?-->/g, '');
	const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
	// 远程/公告内容渲染：剔除危险协议链接与事件属性，防注入
	return md
		.render(clean)
		.replace(/<a\s+href="(?:javascript|vbscript|data):[^"]*"/gi, '<a href="#"')
		.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
}
