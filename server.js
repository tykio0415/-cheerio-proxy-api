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
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
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
