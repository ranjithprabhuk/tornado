// const WebTorrent = require('webtorrent');
import WebTorrent from 'webtorrent'; // = require('webtorrent');
import fs from 'fs';
import path from 'path';
import { cyan, white, yellow } from './colors.js';

const filePath = path.join(process.cwd(), 'links.txt');

async function getMagneticLinksFromFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);
        resolve(lines);
      }
    });
  });
}

// Magnet link to download
const magnetLinks = await getMagneticLinksFromFile();

if (magnetLinks && magnetLinks.length > 0) {
  // Create a new WebTorrent client
  const client = new WebTorrent();
  let completedCount = 0;

  magnetLinks.forEach((magnetLink, index) => {
    if (magnetLink) {
      client.add(magnetLink, { path: path.join(process.cwd(), 'downloads') }, function (torrent) {
        const name = `\x1b[${30 + (index % 6)}m` + torrent.name?.substring(0, 50);

        const getDetailsInInterval = setInterval(function () {
          console.log(name + ' - ' + white + (torrent.progress * 100).toFixed(1) + '%' + cyan);
        }, 10000);

        torrent.on('done', function () {
          console.log(name + white + ' torrent download finished');
          clearInterval(getDetailsInInterval);
          completedCount += 1;
          if (completedCount === magnetLinks.length) {
            console.log(white + '=======================================');
            console.log(white + '== ' + yellow + 'All torrent downloads are done...' + white + ' ==');
            console.log(white + '=======================================');
            process.exit();
          }
        });
      });
    }
  });
}
