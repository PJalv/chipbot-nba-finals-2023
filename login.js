const { default: MessagesClient } = require("./node_modules/messages-web")

const client = new MessagesClient()

client.on('qr-code', (base64Image) => {
    // example code to save image
    fs.writeFileSync('qr.jpg', base64Image.replace(/^data:image\/png;base64,/, ""), { encoding: 'base64' })
    // your code
})

client.on('authenticated', async (service) => {
    const inbox = service.getInbox()
    const credentials = await client.getCredentials()
    fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, '\t'))
    await client.quit()
})