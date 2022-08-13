export const IS_NODE = typeof process !== 'undefined'
export const IN_BROWSER = typeof window !== 'undefined'
export const isElementNode = (node: Node): node is Element => node.nodeType === 1 // Node.ELEMENT_NODE
export const isSVGElementNode = (node: Element): node is SVGElement => typeof (node as SVGElement).className === 'object'
export const isSVGImageElementNode = (node: Element): node is SVGImageElement => isSVGElementNode(node) && node.tagName === 'IMAGE'
export const isHTMLElementNode = (node: Node): node is HTMLElement => isElementNode(node) && typeof (node as HTMLElement).style !== 'undefined' && !isSVGElementNode(node)
export const isTextNode = (node: Node): node is Text => node.nodeType === 3 // Node.TEXT_NODE
export const isImageElement = (node: Element): node is HTMLImageElement => node.tagName === 'IMG'
export const isVideoElement = (node: Element): node is HTMLVideoElement => node.tagName === 'VIDEO'
export const isCanvasElement = (node: Element): node is HTMLCanvasElement => node.tagName === 'CANVAS'
export const isTextareaElement = (node: Element): node is HTMLTextAreaElement => node.tagName === 'TEXTAREA'
export const isInputElement = (node: Element): node is HTMLInputElement => node.tagName === 'INPUT'
export const isStyleElement = (node: Element): node is HTMLStyleElement => node.tagName === 'STYLE'
export const isScriptElement = (node: Element): node is HTMLScriptElement => node.tagName === 'SCRIPT'
export const isSelectElement = (node: Element): node is HTMLSelectElement => node.tagName === 'SELECT'
export const isSlotElement = (node: Element): node is HTMLSlotElement => node.tagName === 'SLOT'

export function isDataUrl(url: string) {
  return url.startsWith('data:')
}

export function resolveUrl(url: string, baseUrl: string | null): string {
  // url is absolute already
  if (url.match(/^[a-z]+:\/\//i)) return url

  // url is absolute already, without protocol
  if (IN_BROWSER && url.match(/^\/\//)) return window.location.protocol + url

  // dataURI, mailto:, tel:, etc.
  if (url.match(/^[a-z]+:/i)) return url

  if (!IN_BROWSER) return url

  const doc = document.implementation.createHTMLDocument()
  const base = doc.createElement('base')
  const a = doc.createElement('a')
  doc.head.appendChild(base)
  doc.body.appendChild(a)
  if (baseUrl) base.href = baseUrl
  a.href = url
  return a.href
}

export function createImage(url: string, ownerDocument: Document, useCORS = false): HTMLImageElement {
  const img = ownerDocument.createElement('img')
  if (useCORS) {
    img.crossOrigin = 'anonymous'
  }
  img.decoding = 'sync'
  img.src = url
  return img
}

type Media = HTMLVideoElement | HTMLImageElement | SVGImageElement

export function loadMedia<T extends Media>(media: T): Promise<T>
export function loadMedia(media: string, ownerDocument: Document): Promise<HTMLImageElement>
export function loadMedia(media: any, ownerDocument?: any): Promise<any> {
  const node: Media = typeof media === 'string'
    ? createImage(media, ownerDocument)
    : media

  return new Promise(resolve => {
    if (isVideoElement(node)) {
      if (node.readyState >= 2 || (!node.src && !node.currentSrc)) return resolve(node)

      node.addEventListener('loadeddata', () => resolve(node), { once: true })
    } else {
      if (isSVGImageElementNode(node)) {
        if (!node.href.baseVal) return resolve(node)
      } else {
        if (!node.src && !node.currentSrc) {
          return resolve(node)
        } else if (node.complete) {
          setTimeout(() => resolve(node), 500)
        }
      }

      node.addEventListener(
        'load',
        () => resolve(node),
        { once: true },
      )

      node.addEventListener(
        'error',
        () => resolve(node),
        { once: true },
      )
    }
  })
}

export const uuid = (function uuid() {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  let counter = 0

  // ref: http://stackoverflow.com/a/6248722/2519373
  const random = () =>
    // eslint-disable-next-line no-bitwise
    `0000${ ((Math.random() * 36 ** 4) << 0).toString(36) }`.slice(-4)

  return () => {
    counter += 1
    return `u${ random() }${ counter }`
  }
})()

const MIMES = {
  woff: 'application/font-woff',
  woff2: 'application/font-woff',
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
} as const

const EXT_RE = /\.([^.\/]+?)$/

export function getMimeType(url: string): string {
  const ext = url.match(EXT_RE)?.[1]?.toLowerCase()
  return MIMES[ext as keyof typeof MIMES] ?? ext
}

export async function waitLoaded(el: HTMLElement) {
  await Promise.all([
    ...Array.from(el.querySelectorAll('img')).map(loadMedia),
    ...Array.from(el.querySelectorAll('video')).map(loadMedia),
  ])
}
