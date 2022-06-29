import { readFile } from 'fs/promises'
import { basename, join } from 'path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import glob from 'glob'

import type { Browser, ElementHandle, Page } from 'puppeteer'
import type { PreviewServer } from 'vite'

function parseHTML(str: string) {
  const styleCode = str.match(/<style>(.*)<\/style>/s)?.[1]
    ?? '* { box-sizing: border-box; }'
  const templateCode = str.match(/<template.*?>(.*)<\/template>/s)?.[1]
    ?? '<div>template</div>'
  const scriptCode = str.match(/<script.*?>.*?export default (.*)<\/script>/s)?.[1]
    ?? 'window.egami.dom2png(document.querySelector(\'body > *\'))'
  return {
    styleCode,
    templateCode,
    scriptCode,
  }
}

const fixturesDir = join(__dirname, 'fixtures')

describe('dom to image', async () => {
  let server: PreviewServer
  let browser: Browser
  let page: Page
  let body: ElementHandle<HTMLBodyElement>
  let style: ElementHandle<HTMLStyleElement>

  beforeAll(async () => {
    process.env.devicePixelRatio = '1'
    server = await preview({ preview: { port: 3000 } })
    browser = await puppeteer.launch()
    page = await browser.newPage()
    await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Puppeteer Vitest Test Page</title>
  <script type="module">
    import * as egami from 'http://localhost:3000/index.mjs'
    window.egami = egami
  </script>
  <style id="style"></style>
</head>
<body></body>
</html>`)
    body = (await page.$('body'))!
    style = (await page.$('#style'))!
  })

  afterAll(async () => {
    delete process.env.devicePixelRatio
    await browser.close()
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve())
    })
  })

  expect.extend({ toMatchImageSnapshot })

  const fixtures = await Promise.all(
    glob.sync(join(fixturesDir, '*.html'))
      .map(async path => {
        return {
          path,
          ...parseHTML(await readFile(path, 'utf-8')),
        }
      }),
  )

  fixtures.forEach(({ path, scriptCode, styleCode, templateCode }) => {
    const name = basename(path).replace('.html', '')
    test(name, async () => {
      await style.evaluate((el, val) => el.innerHTML = val, styleCode)
      await body.evaluate((el, val) => el.innerHTML = val, templateCode)
      // eslint-disable-next-line no-new-func
      let result = await page.evaluate((val) => new Function(`return ${ val }`)(), scriptCode)
      result = result.replace('data:image/png;base64,', '')
      const buffer = Buffer.from(result, 'base64')
      expect(buffer).toMatchImageSnapshot({
        customSnapshotIdentifier: name,
        customSnapshotsDir: fixturesDir,
      })
    })
  })
})
