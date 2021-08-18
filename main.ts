// coinBot.ts
import { PuppetPadlocal } from "wechaty-puppet-padlocal";
import { Contact, log, Message, ScanStatus, Wechaty } from "wechaty";
const puppet = new PuppetPadlocal({}) 
const bot = new Wechaty({
    name: "WeBot",
    puppet,
})
.on("scan", (qrcode: string, status: ScanStatus) => {
    if (status === ScanStatus.Waiting && qrcode) {
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')

        log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

        require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
    } else {
        log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
    }
})

.on("login", (user: Contact) => {
    log.info("WeBot", `${user} login`);
})

.on("logout", (user: Contact, reason: string) => {
    log.info("WeBot", `${user} logout, reason: ${reason}`);
})

.on("message", async (message: Message) => {
    const contact = message.talker()
    const text = message.text()
    const room = message.room()
    if (room) {
        const topic = await room.topic()
        console.log(`Room: ${topic} Contact: ${contact.name()} Text: ${text}`)
    } else {
        // message.say(${text}); // 回复消息
        console.log(`Contact: ${contact.name()} Text: ${text}`)
    }

    if(message.text().toString().includes(".-")){ 
        log.info(message.text().toString()); 
        const s1 = message.text().toString().split("-")[1]; 
        
        let result = await coinBot(s1);
        const member = message.talker();
        if(result != null)
        {
            message.room().say("\n" + result,member);
        }
        else{
            log.info(message.toString());
            message.room().say("\n" + "没这币",member);
        }    
    }
})

.on("error", (error) => {
    log.error("TestBot", 'on error: ', error.stack);
})

bot.start().then(() => {
    log.info("TestBot", "started.");
});

async function coinBot(s1){
    var result;
    const rp = require('request-promise');
    const requestOptions = {
        method: 'GET',
        uri: 'https://fxhapi.feixiaohao.com/public/v1/ticker', // 这里使用的非小号的API
        qs: {
            'start': '0',
            'limit': '5000',  //非小号最高数据5000
            'convert': 'USD'
        },
        json: true,
        gzip: true
    };

    let response = await rp(requestOptions);
    for(var each in response)
    {
        if(response[each]["symbol"].toLowerCase() == s1)
        {
            result = "[币种]: " + response[each]["symbol"] +`\n` + "[价格]: " +response[each]["price_usd"] + '\n' + "[24小时涨幅]: " + response[each]["percent_change_24h"] + "%";
            break;
        }
    }
    return result;
}
