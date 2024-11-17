import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/fetch-html', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'Please provide a valid URL as a query parameter' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const videoSrc = await page.evaluate(() => {
            const muxPlayer = document.querySelector('mux-player');
            return muxPlayer ? muxPlayer.getAttribute('src') : null;
        });

        await browser.close();

        if (!videoSrc) {
            return res.status(404).json({ error: 'Video source not found.' });
        }

        res.redirect(videoSrc);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch the page content.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});