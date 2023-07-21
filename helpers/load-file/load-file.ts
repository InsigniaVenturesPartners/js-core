import * as fs from "fs";
import axios, { ResponseType } from "axios";

export async function loadFile(fileUrl, local = false, axiosOptions = {}) {
  return new Promise(async (resolve, reject) => {
    if (local) {
      fs.readFile(fileUrl, (err, buffer) => {
        if (err) reject(err);

        resolve(buffer);
      });
    } else {
      try {
        const responseType: ResponseType = "arraybuffer";
        let opts = {
          responseType,
        };
        if (axiosOptions) {
          opts = {
            ...opts,
            ...axiosOptions,
          };
        }
        const response = await axios.get(fileUrl, opts);
        const fileBuffer = Buffer.from(response.data, "binary");
        resolve(fileBuffer);
      } catch (err) {
        return reject(err);
      }
    }
  });
}
