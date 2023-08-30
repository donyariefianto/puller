'use strict'
const { MongoClient } = require('mongodb')
const Env = use('Env')
const url = Env.get('URL_MONGO')
const db_ =Env.get('DB_MONGO')
const client = new MongoClient(url)
const db = client.db(db_)
const ObjectID = require('mongodb').ObjectID

class MongoDb {

    async GetCustom (data,collection,skip,paging,sort) {
        const collections = db.collection(collection)
        return await collections.find(data).skip(skip).limit(paging).sort(sort).toArray()
    }

    async CountCustom (data,collection) {
        const collections = db.collection(collection)
        return await collections.countDocuments(data)
    }

    async GetLogs (data,skip,paging,sort) {
        const collections = db.collection('logs')
        return await collections.find(data).skip(skip).limit(paging).sort(sort).toArray()
    }

    async GetLogsFirst () {
        const collections = db.collection('logs')
        return await collections.findOne({})
    }

    async GetLogsLength (data) {
        const collections = db.collection('logs')
        return await collections.countDocuments(data)
    }

    async GetPilihSiapa (data) {
        const client = new MongoClient(Env.get('URL_MONGO_PILIHSIAPA'))
        const db = client.db(Env.get('DB_MONGO_PILIHSIAPA'))
        const collections = db.collection('pilih-siapa')
        return await collections.aggregate(data).toArray()
    }

    async Count_Data_Artemis (data) {
        const collections = db.collection('artmsanpr')
        return await collections.countDocuments(data)
    }

    async aggregates (data) {
        const collections = db.collection('externaldatas')
        const aggCursor = await collections.aggregate(data).toArray()
        return aggCursor
    }

    async getBigData(data){
        const mongoCollection = db.collection('externaldatas')
        let res = [],skip = 0, limit = 100000
        const chek = await mongoCollection.countDocuments(data)
        if (chek>100000) {
            for (let i = 0; i < Math.ceil(chek/100000); i++) {
                console.time(i)
                let temp = await mongoCollection.find(data).skip(skip).limit(limit).toArray()
                console.log(temp.length)
                console.timeEnd(i)
                skip+=limit
                res = res.concat(temp)
            }
            return res
        }else{
            return await mongoCollection.find(data).toArray()
        }
    }

    async findANPR (data) {
        const collections = db.collection('artmsanpr')
        const aggCursor = await collections.find(data).toArray()
        return aggCursor
    }

    async findExternalData (data) {
        const collections = db.collection('externaldatas')
        const res = await collections.find(data).sort({updated_at : -1}).toArray()
        return res
    }

    async UpdateOneExternalData (match, data) {
        const collections = db.collection('externaldatas')
        return collections.updateOne(match,data)
    }

    async DeleteFullCollection (collection) {
        const collections = db.collection(collection)
        return await collections.deleteMany({})
    }

    async UpdateDataByCollection (collection, query, newvalues) {
        const collections = db.collection(collection)
        return await collections.updateOne(query, {$set:newvalues})
    }

    async GetDataByCollection (collection, query) {
        const collections = db.collection(collection)
        return await collections.findOne(query)
    }

    async DeleteByToken (token,id) {
        const collections = db.collection('externaldatas')
        return await collections.deleteMany({externalDataToken:token,userId:Number(id)})
    }

    async DeletePilihSiapa (query) {
        const collections = db.collection('pilih-siapa')
        return await collections.deleteMany(query)
    }

    async DeleteByQuery (query) {
        const collections = db.collection('externaldatas')
        return await collections.deleteMany(query)
    }

    async DeleteByQueryColection (query,collection) {
        const collections = db.collection(collection)
        return await collections.deleteMany(query)
    }

    async UpdateByToken (token,id,data) {
        const collections = db.collection('externaldatas')
        return await collections.updateMany({externalDataToken:token,userId:Number(id)}, {$set:JSON.parse(data)})
    }

    async InsertData (userId, id, token, data) {
        const collections = db.collection('externaldatas')
        return await collections.insertOne({userId : parseInt(userId), externalDataId : parseInt(id), externalDataToken : token, detail : data, created_at : new Date(), updated_at : new Date(), deleted_at : null})
    }

    async InsertLogs (data) {
        const collections = db.collection('logs')
        return await collections.insertOne(data)
    }

    async MultipleInsert (data) {
        const collections = db.collection('externaldatas')
        data._id = new ObjectID()
        return await collections.insertMany(data)
    }
    
    async MultipleInsertAnpr (data) {
        const collections = db.collection('artmsanpr')
        data._id = new ObjectID()
        return await collections.insertMany(data)
    }

    async MultipleUpdate (query, newvalues) {
        const collections = db.collection('externaldatas')
        return await collections.updateMany(query, newvalues)
    }
    
}

module.exports = new MongoDb()
