const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PLUGIN_ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // Prevent directory traversal attacks
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/sandbox/test-sandbox.html';

    const filePath = path.join(PLUGIN_ROOT, safeUrl);

    // Verify file is within the plugin root folder
    if (!filePath.startsWith(PLUGIN_ROOT)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*'); // Disable CORS restrictions for local testing

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
    console.log('\x1b[32m%s\x1b[0m', '  EDGI local dev server is running!');
    console.log('  To test your block instantly, place your sandbox HTML');
    console.log('  file inside the "sandbox/" folder and navigate to:');
    console.log('\x1b[34m%s\x1b[0m', `  http://localhost:${PORT}/sandbox/[your-file].html`);
    console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
    console.log('Press Ctrl+C to stop the server.');
});
