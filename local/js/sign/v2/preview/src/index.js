import { Tag, Loc, Dom, Text, Event } from 'main.core';
import { Loader } from 'main.loader';
import './style.css';

const ratio = 0.25;

export class Preview
{
	#placeholder: HTMLElement;
	#page: HTMLElement;
	#pageNumber: number;
	#scale: number;
	#controls: HTMLElement;
	#blocksContainer: HTMLElement;
	#blocks: Map;
	#urls: string[];
	#loader: Loader;

	constructor()
	{
		this.#placeholder = Tag.render`
			<video
				poster="/bitrix/js/sign/preview/images/sign-preview-document-demo.jpg"
				loop="true"
				muted="true"
				playsinline="true"
				class="sign-preview__placeholder"
			>
				<source type="video/mp4" src="/bitrix/js/sign/preview/images/sign-preview-document-demo.mp4" />
				<source type="video/webm" src="/bitrix/js/sign/preview/images/sign-preview-document-demo.webm" />
			</video>
		`;
		this.#page = Tag.render`<img class="sign-preview__page" />`;
		this.#blocksContainer = Tag.render`<div class="sign-preview__blocks"></div>`;
		this.#blocks = new Map();
		this.#controls = this.#createControls();
		this.#urls = [];
		this.#pageNumber = 0;
		this.#scale = 1;
		this.#loader = new Loader();
	}

	#createBlockStyles(block)
	{
		const { style, position, type } = block;
		const { top, left, width, height, widthPx, heightPx } = position;
		const inlineStyles = {
			...style,
			top: `${position.top}%`,
			left: `${position.left}%`,
			width: `${width}%`,
			height: `${height}%`
		};
		if (type === 'image')
		{
			return inlineStyles;
		}

		const { width: pageWidth, height: pageHeight } = this.#page.getBoundingClientRect();
		const widthRatio = widthPx / (width / 100 * pageWidth);
		const heightRatio = heightPx / (height / 100 * pageHeight);
		const fontSize = (parseFloat(style['fontSize']) || 14 ) / widthRatio;
		const padding = `${5 / heightRatio}px ${8 / widthRatio}px`;
		Object.assign(inlineStyles, {
			padding,
			fontSize: `${fontSize}px`
		});

		return inlineStyles;
	}

	async #createBlocks(blocksData)
	{
		const isLoaded = this.#page.complete && this.#page.naturalHeight !== 0;
		if (!isLoaded)
		{
			await new Promise((resolve) => Event.bindOnce(this.#page, 'load', resolve));
		}

		const { blocksTemplate, blocks } = blocksData.reduce((acc, block) => {
			const node = Tag.render`
				<div class="sign-preview__block"></div>
			`;
			const blockContent = this.#getBlockContent(block);
			if (blockContent)
			{
				Dom.append(blockContent, node);
				Dom.addClass(node, '--filled');
			}

			const inlineStyles = this.#createBlockStyles(block);
			Object.keys(inlineStyles).forEach(styleName => {
				node.style[styleName] = inlineStyles[styleName];
			});
			const { blocks, blocksTemplate } = acc;
			const { page } = block.position;
			blocks.set(page, [
				...(blocks.get(page) ?? []),
				node
			]);
			Dom.append(node, blocksTemplate);

			return acc;
		}, {
			blocks: new Map(),
			blocksTemplate: new DocumentFragment()
		});
		Dom.append(blocksTemplate, this.#blocksContainer);

		return blocks;
	}

	#getBlockContent(block): HTMLElement | null
	{
		if (block.type === 'image')
		{
			return this.#getImageLayout(block);
		}

		return this.#getTextLayout(block);
	}

	#getImageLayout(block): HTMLElement | null
	{
		const url = block.data.__view?.base64;
		if (!url)
		{
			return null;
		}

		const img = Tag.render`<img src="data:image;base64,${url}" />`;

		return img;
	}

	#getTextLayout(block): HTMLElement | null
	{
		let text = block.data.text;
		if (!text)
		{
			return null;
		}
		text = Text.encode(text);

		const span = Tag.render`<span>${text}</span>`;
		span.innerHTML = text.replaceAll('[br]', '<br />');

		return span;
	}

	#createContent(): HTMLElement
	{
		const content = Tag.render`
			<div class="sign-preview__content">
				${this.#placeholder}
				${this.#page}
				${this.#blocksContainer}
			</div>
		`;
		this.#loader.setOptions({ target: content, size: 80 });

		return content;
	}

	#createControls(): HTMLElement
	{
		const pagination = Tag.render`
			<div class="sign-preview__pagination">
				<span
					class="sign-preview__btn sign-preview__pagination_btn --prev"
					onclick="${() => {
						this.#pageNumber -= 1;
						this.#render();
					}}"
				>
				</span>
				<span class="sign-preview__pagination_page-num"></span>
				<span
					class="sign-preview__btn sign-preview__pagination_btn --next"
					onclick="${() => {
						this.#pageNumber += 1;
						this.#render();
					}}"
				>
				</span>
			</div>
		`;
		const zoom = Tag.render`
			<div class="sign-preview__zoom">
				<span
					class="sign-preview__btn sign-preview__zoom_btn --plus"
					onclick="${() => {
						this.#scale -= ratio;
						this.#renderContent();
						this.#renderZoom();
					}}"
				>
				</span>
				<span class="sign-preview__zoom_value">100%</span>
				<span
					class="sign-preview__btn sign-preview__zoom_btn --minus"
					onclick="${() => {
						this.#scale += ratio;
						this.#renderContent();
						this.#renderZoom();
					}}"
				></span>
			</div>
		`;

		return Tag.render`
			<div class="sign-preview__controls">
				${pagination}
				${zoom}
			</div>
		`;
	}

	getLayout(): HTMLElement
	{
		const layout = Tag.render`
			<div class="sign-preview">
				${this.#createContent()}
				${this.#controls}
			</div>
		`;
		this.#render();

		return layout;
	}

	#render()
	{
		this.#renderContent();
		this.#renderBlocks();
		this.#renderControls();
	}

	#renderContent()
	{
		Dom.removeClass(this.#placeholder, '--hidden');
		Dom.removeClass(this.#page, '--hidden');
		if (!this.#urls.length)
		{
			Dom.addClass(this.#page, '--hidden');
			this.#page.src = '';
			this.#page.style.transform = '';
			this.#placeholder.play();
			return;
		}

		Dom.addClass(this.#placeholder, '--hidden');
		const url = this.#urls[this.#pageNumber];
		this.#page.src = url;
		this.#page.style.transform = `scale(${this.#scale})`;
	}

	#renderBlocks()
	{
		const visibleBlocks = this.#blocks.get(this.#pageNumber + 1) ?? [];
		const allBlocks = [...this.#blocks.values()].flat();
		allBlocks.forEach((block) => {
			if (visibleBlocks.includes(block))
			{
				Dom.removeClass(block, '--hidden');
				return;
			}

			Dom.addClass(block, '--hidden');
		});
	}

	#renderControls()
	{
		if (!this.#urls.length)
		{
			Dom.addClass(this.#controls, '--locked');
			this.#pageNumber = 0;
			this.#scale = 1;
			return;
		}

		Dom.removeClass(this.#controls, '--locked');
		this.#renderPagination();
		this.#renderZoom();
	}

	#renderPagination()
	{
		const [pagination] = this.#controls.children;
		const [prevBtn, content, nextBtn] = pagination.children;
		const message = Loc.getMessage('SIGN_PREVIEW_PAGE');
		const totalPages = this.#urls.length;
		Dom.removeClass(prevBtn, '--disabled');
		Dom.removeClass(nextBtn, '--disabled');
		content.textContent = `${message} ${this.#pageNumber + 1}/${totalPages}`;
		if (this.#pageNumber === 0)
		{
			Dom.addClass(prevBtn, '--disabled');
		}
		if (this.#pageNumber === totalPages - 1)
		{
			Dom.addClass(nextBtn, '--disabled');
		}
	}

	#renderZoom()
	{
		const [,zoom] = this.#controls.children;
		const [zoomOutBtn, content, zoomInBtn] = zoom.children;
		content.textContent = `${this.#scale * 100}%`;
		if (this.#scale !== 1)
		{
			Dom.addClass(this.#page.parentElement, '--overflowed');
			Dom.removeClass(zoomOutBtn, '--disabled');
			if (this.#scale === 2)
			{
				Dom.addClass(zoomInBtn, '--disabled');
			}
		}
		else
		{
			Dom.addClass(zoomOutBtn, '--disabled');
			Dom.removeClass(zoomInBtn, '--disabled');
			Dom.removeClass(this.#page.parentElement, '--overflowed');
		}
	}

	set urls(urls: string[])
	{
		this.#urls = urls;
		this.#renderContent();
		this.#renderControls();
	}

	set ready(isReady: boolean)
	{
		if (isReady)
		{
			this.#loader.hide();
			return;
		}

		this.#loader.show();
	}

	async setBlocks(blocks)
	{
		Dom.clean(this.#blocksContainer);
		if (!blocks?.length)
		{
			return;
		}

		this.#blocks = await this.#createBlocks(blocks);
		this.#renderBlocks();
	}
}