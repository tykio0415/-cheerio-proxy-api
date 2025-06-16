import express from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/cheerio', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.status(400).json({ error: 'Missing URL parameter' })

  try {
const response = await axios.get(targetUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Referer": "https://www.dcard.tw/"
  }
});
    const $ = cheerio.load(response.data)

    const title = $('title').text()
    const images = $('img').map((i, el) => $(el).attr('src')).get()
    const paragraphs = $('p').map((i, el) => $(el).text()).get()

    res.json({ title, images, paragraphs, html: $.html() })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or parse', detail: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Cheerio Proxy running at http://localhost:${PORT}`)
})
