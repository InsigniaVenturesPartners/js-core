import fs from 'fs'
import axios from 'axios'

export default async function loadFile (fileUrl, local = false) {
  return new Promise(async (resolve, reject) => {
    if (local) {
      fs.readFile(fileUrl, (err, buffer) => {
        if (err) reject(err)

        resolve(buffer)
      })
    } else {
      try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
        const fileBuffer = Buffer.from(response.data, 'binary')
        resolve(fileBuffer)
      } catch (err) {
        return reject(err)
      }
    }
  })
}
