const fs = require('fs');
const path = require('path');
const http2 = require('http2');

const PORT = process.env.PORT || 8443;
const KEY_PATH = path.join(__dirname, 'key.pem');
const CERT_PATH = path.join(__dirname, 'cert.pem');

// 1. SSL/TLS Self-Signed Certificate Generation
if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
    console.log('[HTTP/2 Server] SSL certificates key.pem/cert.pem not found.');
    console.log('[HTTP/2 Server] Setting up self-signed SSL certificate...');
    try {
        require.resolve('selfsigned');
    } catch (e) {
        console.log('[HTTP/2 Server] Installing "selfsigned" dependency dynamically to generate certs...');
        const { execSync } = require('child_process');
        execSync('npm install selfsigned', { stdio: 'inherit', cwd: __dirname });
    }
    
    try {
        const selfsigned = require('selfsigned');
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, {
            keySize: 2048,
            days: 365,
            algorithm: 'sha256',
            extensions: [{
                name: 'basicConstraints',
                cA: true
            }, {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            }, {
                name: 'subjectAltName',
                altNames: [
                    { type: 2, value: 'localhost' },
                    { type: 7, ip: '127.0.0.1' },
                    { type: 7, ip: '::1' }
                ]
            }]
        });

        fs.writeFileSync(KEY_PATH, pems.private);
        fs.writeFileSync(CERT_PATH, pems.cert);
        console.log('[HTTP/2 Server] Certificates generated successfully (key.pem, cert.pem).');
    } catch (err) {
        console.error('[HTTP/2 Server] FAILED to generate SSL certificates:', err);
        process.exit(1);
    }
}

// 2. Configure HTTP/2 server options
const serverOptions = {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
    allowHTTP1: true // Fallback to HTTP/1.1 for older clients / test tools
};

// MIME Type Mapping
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
};

// 3. Create Secure HTTP/2 Server
const server = http2.createSecureServer(serverOptions);

server.on('stream', (stream, headers) => {
    // Handle stream-level errors (e.g. ECONNRESET on sudden client disconnects) to prevent crash
    stream.on('error', (err) => {
        if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
            console.error('[HTTP/2 Server] Stream error:', err);
        }
    });

    const method = headers[':method'];
    const requestPath = headers[':path'];

    // Respond only to GET or HEAD requests
    if (method !== 'GET' && method !== 'HEAD') {
        stream.respond({ ':status': 405, 'content-type': 'text/plain' });
        stream.end('Method Not Allowed');
        return;
    }

    // Parse URL path
    const parsedUrl = new URL(requestPath, 'https://localhost');
    let relativePath = decodeURIComponent(parsedUrl.pathname);

    // Security check: block null bytes and directory traversal attacks
    if (relativePath.includes('\0') || relativePath.includes('..')) {
        stream.respond({ ':status': 400, 'content-type': 'text/plain' });
        stream.end('Bad Request');
        return;
    }

    // Map path to disk
    let filePath = path.join(__dirname, relativePath);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            // File not found fallback
            stream.respond({ ':status': 404, 'content-type': 'text/html; charset=utf-8' });
            stream.end('<h1>404 Not Found</h1><p>The requested resource could not be found.</p>');
            return;
        }

        // Handle directories
        if (stats.isDirectory()) {
            if (!relativePath.endsWith('/')) {
                // Redirect to add trailing slash
                stream.respond({
                    ':status': 301,
                    'location': relativePath + '/'
                });
                stream.end();
                return;
            }

            // Append index.html for folder routes
            filePath = path.join(filePath, 'index.html');
            fs.stat(filePath, (indexErr, indexStats) => {
                if (indexErr || !indexStats.isFile()) {
                    stream.respond({ ':status': 404, 'content-type': 'text/html' });
                    stream.end('<h1>404 Not Found</h1><p>Directory listing is disabled.</p>');
                    return;
                }
                serveFile(filePath);
            });
        } else if (stats.isFile()) {
            serveFile(filePath);
        } else {
            stream.respond({ ':status': 404, 'content-type': 'text/plain' });
            stream.end('Not Found');
        }
    });

    function serveFile(targetPath) {
        const ext = path.extname(targetPath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        const responseHeaders = {
            'content-type': mimeType,
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'SAMEORIGIN',
            ':status': 200
        };

        // Cache policy optimization
        if (ext === '.html') {
            responseHeaders['cache-control'] = 'no-cache, no-store, must-revalidate';
        } else if (['.css', '.js', '.webp', '.png', '.jpeg', '.jpg', '.ico'].includes(ext)) {
            responseHeaders['cache-control'] = 'public, max-age=31536000, immutable';
        }

        // Zero-copy high performance file streaming
        stream.respondWithFile(targetPath, responseHeaders, {
            onError: (err) => {
                console.error(`[HTTP/2 Server] Error transmitting ${targetPath}:`, err);
                if (!stream.headersSent) {
                    stream.respond({ ':status': 500, 'content-type': 'text/plain' });
                    stream.end('Internal Server Error');
                }
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 HTTP/2 Secure Server successfully running at:`);
    console.log(`👉 https://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
