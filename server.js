import express from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const SCRAPE_API_KEY = process.env.SCRAPE_API_KEY  // 請放在 .env 檔案中

app.get('/cheerio', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.status(400).json({ error: 'Missing URL parameter' })

  try {
    // Step 1：先試著用原生 axios 抓
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const $ = cheerio.load(response.data)
    const title = $('title').text()
    const images = $('img').map((i, el) => $(el).attr('src')).get()
    const paragraphs = $('p').map((i, el) => $(el).text()).get()

    return res.json({ title, images, paragraphs, html: $.html(), used: 'native' })

  } catch (err) {
    console.warn("⚠️ Native fetch failed:", err.message)

    if (!SCRAPE_API_KEY) {
      return res.status(500).json({ error: 'Scrape API Key missing', detail: err.message })
    }

    // Step 2：失敗後 fallback 到 Scrape.do
    try {
      const scrapeUrl = `https://api.scrape.do?token=${SCRAPE_API_KEY}&url=${encodeURIComponent(targetUrl)}`
      const response = await axios.get(scrapeUrl)

      const $ = cheerio.load(response.data)
      const title = $('title').text()
      const images = $('img').map((i, el) => $(el).attr('src')).get()
      const paragraphs = $('p').map((i, el) => $(el).text()).get()

      return res.json({ title, images, paragraphs, html: $.html(), used: 'scrape.do' })

    } catch (err2) {
      return res.status(500).json({ error: 'Scrape.do failed', detail: err2.message })
    }
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Cheerio Proxy running at http://localhost:${PORT}`)
})
