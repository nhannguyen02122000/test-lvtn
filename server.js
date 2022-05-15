const { createServer: createHttpsServer } = require('https')
const { createServer: createHttpServer } = require('http')
const next = require('next')
const fs = require('fs')
const url = require('url')
const conf = require('./next.config')

const port = process.env.PORT //* Feel free to use your own port
const hostDomain = `https://local-lvtn.vercel.app` //* Feel free to use your own hostDomain
const dev = process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'live'
const app = next({ dev, conf })
const handle = app.getRequestHandler()

const httpsOptions = {
  //* If you use your own hostDomain, you need to register a new certificate by yourself
  //* More info: https://web.dev/how-to-use-local-https/
  //* The root.example.cer file in /certs folder is used for register your certificate to other devices, you should get it from your machine which you issued the certificate
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
}

app.prepare().then(() => {
  createHttpsServer(httpsOptions, (req, res) => {
    const parsedUrl = url.parse(`${hostDomain}${req.url}`, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    // eslint-disable-next-line no-console
    console.log(`🚀 ready - started server on url: ${hostDomain}:${port}`)
  })

  //* Uncomment those line of code if you want to auto redirect from http to https at certain port
  createHttpServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}:${port}${req.url}` })
    res.end()
  }).listen(80)
})
