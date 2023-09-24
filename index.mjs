import open from 'open'
import { Headers } from 'node-fetch'
import axios from 'axios'
import fs from 'fs'
import cheerio from 'cheerio'
import { question } from 'readline-sync'

const headers = new Headers();
headers.append('User-Agent', 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet');
const headersWm = new Headers();
headersWm.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36');

const getIdVideo = (url) => {
    const matching = url.includes("/video/")
    if (!matching) {
        console.log(chalk.red("[X] Error: URL not found"));
        exit();
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}

const getVideoNoWM = async (url) => {
    const idVideo = await getIdVideo(url)
    const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
    const request = await fetch(API_URL, {
        method: "GET",
        headers
    });
    const body = await request.text();
    try {
        var res = JSON.parse(body);
    } catch (err) {
        console.error("Error:", err);
        console.error("Response body:", body);
    }
    const urlMedia = res.aweme_list[0].video.play_addr.url_list[0]
    const data = {
        url: urlMedia,
        id: idVideo
    }
    return data
}

async function downloadVideo(url, outputFileName) {
    try {
        const response = await axios.get(url, { responseType: 'stream' });

        const outputFileStream = fs.createWriteStream('./videos/' + outputFileName);

        response.data.pipe(outputFileStream);

        return new Promise((resolve, reject) => {
            outputFileStream.on('finish', () => resolve());
            outputFileStream.on('error', (error) => reject(error));
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}


const url = question('Bota o link do video ai pora:  ')

const video = await getVideoNoWM(url)

const name = question('Da um nome pro video ai zé: ')

await downloadVideo(video.url, name + `.mp4`)
console.log(video)