const https = require('https');

const data = JSON.stringify({
    event: 'CHECK_INTEGRATION'
});

const options = {
    hostname: 'pontoumdigital-v3.vercel.app',
    port: 443,
    path: '/api/automarticles/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'access-token': '179055f650fb3e03b140e1522d77e70e'
    }
};

console.log('Enviando requisição de teste para:', `https://${options.hostname}${options.path}`);
console.log('Token usado:', options.headers['access-token']);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
