<h1 align="center">modern-screenshot</h1>

<p align="center">
  <a href="https://github.com/qq15725/modern-screenshot/blob/master/LICENSE" class="mr-3">
    <img src="https://img.shields.io/npm/l/modern-screenshot.svg" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/modern-screenshot">
    <img src="https://img.shields.io/npm/v/modern-screenshot.svg" alt="Version">
  </a>
  <a href="https://cdn.jsdelivr.net/npm/modern-screenshot/dist/index.js">
    <img src="https://img.shields.io/bundlephobia/minzip/modern-screenshot" alt="Minzip">
  </a>
</p>

<p align="center">使用 HTML5 canvas 和 SVG 生成图像</p>

<p align="center">Fork from <a href="https://github.com/bubkoo/html-to-image">html-to-image</a></p>

<p align="center"><a href="README.md">English</a> | 简体中文</p>

## 📦 安装

```sh
npm i modern-screenshot
```

## 🦄 使用

### 基本用法

```ts
import { domToPng } from 'modern-screenshot'

domToPng(document.querySelector('#app')).then(base64 => {
  open().document.write(`<img src="${ base64 }" />`)
})
```

### CDN

```html
<script src="https://unpkg.com/modern-screenshot"></script>
<script>
  modernScreenshot.domToPng(document.querySelector('body')).then(base64 => {
    open().document.write(`<img src="${ base64 }" />`)
  })
</script>
```

### 浏览器控制台

> ⚠️ 由于 CORS 部分嵌入将失败

```js
const script = document.createElement('script')
script.src = "https://unpkg.com/modern-screenshot"
document.getElementsByTagName('head')[0].appendChild(script)

script.onload = () => {
  modernScreenshot
    .domToImage(document.querySelector('body'), { log: console })
    .then(img => {
      const width = 600
      const height = img.height * (width / img.width)
      console.log('%c ', [
        `padding: 0 ${ width / 2 }px;`,
        `line-height: ${ height }px;`,
        `background-image: url('${ img.src }');`,
        `background-size: 100% 100%;`,
      ].join(''))
    })
}
```

## 所有转换

```ts
declare function canvasToblob(
  canvas: HTMLCanvasElement,
  options?: BlobOptions,
): Promise<Blob | null>;

declare function domToBlob<T extends Node>(
  node: T,
  options?: Options & BlobOptions,
): Promise<Blob | null>;

declare function domToCanvas<T extends Node>(
  node: T,
  options?: Options,
): Promise<HTMLCanvasElement>;

declare function domToImage<T extends Node>(
  node: T,
  options?: Options,
): Promise<HTMLImageElement>;

declare function domToJpeg<T extends Node>(
  node: T,
  options?: Options & JpegOptions,
): Promise<string>;

declare function domToPixel<T extends Node>(
  node: T,
  options?: Options,
): Promise<Uint8ClampedArray>;

declare function domToPng<T extends Node>(
  node: T,
  options?: Options,
): Promise<string>;

declare function domToSvg<T extends Node>(
  node: T,
  options?: Options,
): Promise<SVGElement>;

declare function imageToCanvas<T extends HTMLImageElement>(
  image: T,
  options?: Options,
): Promise<HTMLCanvasElement>;

declare function svgToCanvas<T extends SVGElement>(
  svg: T,
  options?: Options,
): Promise<HTMLCanvasElement>;

declare function svgToImage<T extends SVGElement>(
  svg: T,
): HTMLImageElement;
```

## 选项

```ts
export interface Options {
  /**
   * Width in pixels to be applied to node before rendering.
   */
  width?: number

  /**
   * Height in pixels to be applied to node before rendering.
   */
  height?: number

  /**
   * The pixel ratio of captured image. Defalut is the actual pixel ratio of
   * the device. Set 1 to use as initial-scale 1 for the image
   */
  scale?: number

  /**
   * A string value for the background color, any valid CSS color value.
   */
  backgroundColor?: string

  /**
   * An object whose properties to be copied to node's style before rendering.
   */
  style?: Partial<CSSStyleDeclaration>

  /**
   * A function taking DOM node as argument. Should return `true` if passed
   * node should be included in the output. Excluding node means excluding
   * it's children as well.
   */
  filter?: (el: Node) => boolean

  /**
   * Maximum canvas size (pixels).
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
   *
   * default: 16384
   */
  maximumCanvasSize?: number

  /**
   * Fetch resources
   */
  fetch?: {
    /**
     * the second parameter of window.fetch RequestInit
     */
    requestInit?: RequestInit

    /**
     * Set to `true` to append the current time as a query string to URL
     * requests to enable cache busting.
     */
    bypassingCache?: boolean

    /**
     * A data URL for a placeholder image that will be used when fetching
     * an image fails. Defaults to an empty string and will render empty
     * areas for failed images.
     */
    placeholderImage?: string
  }

  /**
   * Fonts download and embed.
   */
  font?: false | {
    /**
     * The preferred font format. If specified all other font formats are ignored.
     */
    preferredFormat?: 'woff' | 'woff2' | 'truetype' | 'opentype' | 'embedded-opentype' | 'svg' | string

    /**
     * A CSS string to specify for font embeds. If specified only this CSS will
     * be present in the resulting image.
     */
    cssText?: string
  }
}

export interface JpegOptions {

  /**
   * A number between `0` and `1` indicating image quality (e.g. 0.92 => 92%)
   * of the JPEG image.
   */
  quality?: number
}

export interface BlobOptions extends JpegOptions {
  /**
   * A string indicating the image format. The default type is image/png; that type is also used if the given type isn't supported.
   */
  type?: string
}
```