'use strict'
const { MongoClient } = require('mongodb');
const Env = use('Env');
const url = Env.get('URL_MONGO')
const db_ =Env.get('DB_MONGO')
const client = new MongoClient(url);
const db = client.db(db_);
const ObjectID = require('mongodb').ObjectID

class MongoDb {
    async Count_Data_Artemis (data) {
        const collections = db.collection('artmsanpr');
        return await collections.countDocuments(data);
    }

    async aggregates (data) {
        const collections = db.collection('externaldatas');
        const aggCursor = await collections.aggregate(data).toArray();
        return aggCursor
    }

    async findANPR (data) {
        const collections = db.collection('artmsanpr');
        const aggCursor = await collections.find(data).toArray();
        return aggCursor
    }

    async findExternalData (data) {
        const collections = db.collection('externaldatas');
        const res = await collections.find(data).toArray();
        return res
    }

    async UpdateOneExternalData (match, data) {
        const collections = db.collection('externaldatas');
        return collections.updateOne(match,data);
    }

    async DeleteByToken (token,id) {
        const collections = db.collection('externaldatas');
        return await collections.deleteMany({externalDataToken:token,userId:Number(id)});
    }

    async DeleteByQuery (query) {
        const collections = db.collection('externaldatas');
        return await collections.deleteMany(query);
    }

    async DeleteByQueryColection (query,collection) {
        const collections = db.collection(collection);
        return await collections.deleteMany(query);
    }

    async UpdateByToken (token,id,data) {
        const collections = db.collection('externaldatas');
        return await collections.updateMany({externalDataToken:token,userId:Number(id)}, {$set:JSON.parse(data)});
    }

    async InsertData (userId, id, token, data) {
        const collections = db.collection('externaldatas');
        return await collections.insertOne({userId : parseInt(userId), externalDataId : parseInt(id), externalDataToken : token, detail : data, created_at : new Date(), updated_at : new Date(), deleted_at : null});
    }

    async InsertLogs (data) {
        return console.log(data);
        const collections = db.collection('logs');
        return await collections.insertOne(data);
    }

    async MultipleInsert (data) {
        const collections = db.collection('externaldatas');
        data._id = new ObjectID();
        return await collections.insertMany(data);
    }
    
    async MultipleInsertAnpr (data) {
        const collections = db.collection('artmsanpr');
        data._id = new ObjectID();
        return await collections.insertMany(data);
    }

    async MultipleUpdate (query, newvalues) {
        const collections = db.collection('externaldatas');
        return await collections.updateMany(query, newvalues);
    }
    
}

module.exports = new MongoDb()
