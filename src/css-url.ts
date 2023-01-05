import { fetchDataUrl } from './fetch'
import { isDataUrl, resolveUrl } from './utils'

import type { ResolvedOptions } from './options'

export async function replaceCssUrlToDataUrl(
  cssText: string,
  baseUrl: string | null,
  options: ResolvedOptions,
  isImage?: boolean,
): Promise<string> {
  if (!hasCssUrl(cssText)) return cssText

  for (const url of parseCssUrls(cssText)) {
    try {
      const dataUrl = await fetchDataUrl(
        baseUrl
          ? resolveUrl(url, baseUrl)
          : url,
        options,
        isImage,
      )
      cssText = cssText.replace(toRE(url), `$1${ dataUrl }$3`)
    } catch (error) {
      console.warn(error)
    }
  }

  return cssText
}

export function hasCssUrl(cssText: string): boolean {
  return /url\((['"]?)([^'"]+?)\1\)/.test(cssText)
}

function parseCssUrls(cssText: string): string[] {
  const result: string[] = []

  cssText.replace(/url\((['"]?)([^'"]+?)\1\)/g, (raw, quotation, url) => {
    result.push(url)
    return raw
  })

  return result.filter((url) => !isDataUrl(url))
}

function toRE(url: string): RegExp {
  // eslint-disable-next-line no-useless-escape
  const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1')
  return new RegExp(`(url\\(['"]?)(${ escaped })(['"]?\\))`, 'g')
}
