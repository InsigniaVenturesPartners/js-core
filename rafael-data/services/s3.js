import {S3 as _S3} from 'aws-sdk'
import encodeRFC5987ValueChars from '../helpers/functions/encodeRFC5987ValueChars';

class S3 {
  constructor(bucket = null, region = null, params = {}) {
    this.region = region || process.env.DEFAULT_BUCKET_REGION
    this.bucket = bucket || process.env.DEFAULT_BUCKET
    this.s3 = new _S3({ apiVersion: '2006-03-01', region: this.region })

    this.params = params
  }


  contentType(contentType, filename) {
    this.params = {
      ...this.params,
      ...{
        ContentType: contentType,
        ContentDisposition: `attachment; filename="${encodeRFC5987ValueChars(filename)}"`
      }
    }

    return this
  }

  asPdf(filename = 'report') {
    this.params = {
      ...this.params,
      ...{
        ContentType: 'application/pdf',
        ContentDisposition: `attachment; filename="${encodeRFC5987ValueChars(filename)}.pdf"`
      }
    }

    return this
  }

  /*
    Find file

    @return String fileUrl
  */
  async find(filePath) {
    const params = {
      Bucket: this.bucket,
      Key: filePath
    }

    return new Promise((resolve, reject) => {
      this.s3.headObject(params, (err, output) => {
        if (err && err.code === 'NotFound') {
          return resolve(null)
        } else if (err) {
          return reject(new Error(`[S3] Cannot find '${filePath}'. Error: ${err.message}. Code: ${err.code}`))
        }
        filePath = filePath.split('/').map(part => encodeURIComponent(part)).join('/')

        resolve({
          md5: output.ETag.split('"').join(''),
          url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`
        })
      })
    })
  }

  async findOrCreate(filePath, body, otherParams = {}, acl = 'public-read') {
    let fileUrl
    const file = await this.find(filePath)

    if (file) {
      fileUrl = file.url
    } else {
      fileUrl = await this.create(...arguments)
    }

    return fileUrl
  }

  create(filePath, body, options = {}, acl = 'public-read') {
    console.log('Copy to S3 : ' + filePath);
    const params = {
      Bucket: this.bucket,
      Key: filePath,
      Body: body,
      ACL: acl,
      ...this.params,
      ...options
    }

    return new Promise((resolve, reject) => {
      this.s3.upload(params, function (err, data) {
        if (err) return reject(new Error(`[S3] Cannot upload to '${filePath}'. Error: ${err.message}`))

        resolve(data ? data.Location : data)
      })
    })
  }

  delete(filePath, body, options = {}, acl = 'public-read') {
    filePath = this.getPath(filePath)
    const params = {
      Bucket: this.bucket,
      Key: filePath,
      ...options
    }

    return new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) return reject(new Error(`[S3] Cannot delete file: '${filePath}'. Error: ${err.message}`))

        resolve(true)
      })
    })
  }

  getPath(filePath) {
    if (filePath.includes('.amazonaws.com/')) {
      return filePath.split('.amazonaws.com/')[1]
    }

    return filePath
  }

  listObjects(prefix) {
    const params = {
      Bucket: this.bucket,
      Prefix: prefix
    }
    return this.s3.listObjectsV2(params).promise()
  }

  getObject(key) {
    const params = {
      Bucket: this.bucket,
      Key: key
    }
    return this.s3.getObject(params).promise()
  }
}

export default S3
