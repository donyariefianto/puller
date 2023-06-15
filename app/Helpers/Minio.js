'use strict'
const Minio = use("minio")
var fs = use('fs')
const Env = use('Env')
const bucket = Env.get('MINIO_BUCKET')

var s3Client = new Minio.Client({
    useSSL: false,
    endPoint: Env.get('MINIO_ENDPOINT'),
    port: Number(Env.get('MINIO_PORT')),
    accessKey: Env.get('MINIO_KEY'),
    secretKey: Env.get('MINO_SECRET')
})

class MinioS3 {

    async GetObject (path) {
        if (!path) {
            throw new Error("Invalid parameter path")
        }
        return await s3Client.statObject(bucket,path)
    }

    async PutObject (name,buffer_data,meta) {
        if (!name) {
            throw new Error("Invalid parameter name")
        }
        if (!buffer_data) {
            throw new Error("Invalid parameter buffer_data")
        }
        if (!meta) {
            throw new Error("Invalid parameter meta")
        }
        return await s3Client.putObject(bucket,name,buffer_data,meta)
    }

    async RemoveObject (path) {
        if (!path) {
            throw new Error("Invalid parameter path")
        }
        return await s3Client.removeObject(bucket,path)
    }
}

module.exports = new MinioS3()