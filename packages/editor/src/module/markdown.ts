import MarkdownIt from 'markdown-it';

export function markndownToHtml(markdown: string) {
	const clean = markdown.replace(/<!--[\s\S]*?-->/g, '');
	const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
	return md
		.render(clean)
		.replace(/<a\s+href="(?:javascript|vbscript|data):[^"]*"/gi, '<a href="#"')
		.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
}
