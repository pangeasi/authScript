import * as QrCode from 'qrcode-reader'
import {read} from 'jimp'
import {readdirSync, readFileSync} from 'fs'
import * as path from 'path'
import * as totp from "totp-generator";
import * as fs from 'fs';
const outputFolder = 'doc';

const pathQR = (__dirname.split('src')[0] + path.normalize('/putYourQRcodeHere'))
const qrImage = readdirSync(pathQR)
if (qrImage.length == 0) {
    console.log('guarda tu qr en formato imagen en la carpeta putYourQRcodeHere')
    process.exit()
}
const qrBuffer = readFileSync(`${pathQR}${path.normalize(`/${qrImage[0]}`)}`)

const resultQR = (): Promise<String> => {
    return new Promise((resolve) => {
        read(qrBuffer, (err, img) => {
            img.resize(800,800)
            if(err) console.log('ERR:', err)
            let qr = new QrCode()
            qr.callback = (err, value) => {
                if(err){
                    console.log('ERR QR:', err)
                }else{
                    resolve(value.result)
                }
            }
            qr.decode(img.bitmap)
        })
    })
}

const printTotp = async () => {
    if(!process.argv[2]) console.log('pasa tu pass como argumento, ejemplo: npm start [password]')
    const secret = (await resultQR()).split('&')[1].replace('secret=','')
    console.log(`${process.argv[2] || '[aqui irá tu pass] '}${totp(secret)}`)
    return `${process.argv[2] || '[aqui irá tu pass] '}${totp(secret)}`;
}

const writeFile = async () => {
    const totp = await printTotp()
    fs.writeFileSync(`${outputFolder}/password`,  totp);
}

const main = async () => {
    await writeFile()
    setInterval(writeFile, 30000)
}


main()