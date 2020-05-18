import fs from 'fs'
import request from 'request'

export default async function loadFile (fileUrl, local = false) {
  return new Promise((resolve, reject) => {
    if (local) {
      fs.readFile(fileUrl, (err, buffer) => {
        if (err) reject(err)

        resolve(buffer)
      })
    } else {
      request.get({ url: fileUrl, encoding: null }, (err, resp, buffer) => {
        if (err) reject(err)

        resolve(buffer)
      })
    }
  })
}
