import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const Port = process.env.PORT || 3000

app.get('/fetch-html', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        // format url : http://localhost:3000/fetch-html?url=https://www.playbook.com/s/gurjit/personal?assetToken=TBnnfycsnH6j8wTXbg4XoEK1
        return res.status(400).json({ error: 'Please provide a valid URL as a query parameter' });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract the src from the mux-player element
        const videoSrc = await page.evaluate(() => {
            const muxPlayer = document.querySelector('mux-player');
            return muxPlayer ? muxPlayer.getAttribute('src') : null;
        });

        await browser.close();

        if (!videoSrc) {
            return res.status(404).json({ error: 'Video source not found.' });
        }

        // Redirect to the video file
        res.redirect(videoSrc);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch the page content.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});