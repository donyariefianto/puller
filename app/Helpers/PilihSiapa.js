const Mongo = use("App/Models/MongoDb")

class PilihSiapa {

    async getPilihSiapaPoint () {
        const data  = await Mongo.GetPilihSiapa([
            {
                '$match': {
                'name': 'answer'
                }
            }, {
                '$group': {
                '_id': '$uuid', 
                'data': {
                    '$last': '$$ROOT'
                }
                }
            }
        ])
        return data.map(e=>{
            return e.data
        })
    }

    async getPilihSiapaAnswer () {
        const data  = await Mongo.GetPilihSiapa([
            {
                '$match': {
                'name': 'answer'
                }
            }
        ])
        return data
    }

    async getPilihSiapaQuestions (id) {
        let query = {name:'questions'}
        if (id) {
            query.id = id
        }
        const data  = await Mongo.GetPilihSiapa([
            {
                '$match': query
            }
        ])
        return data
    }

    async getPilihSiapaClaim () {
        let query = {name:'claim'}
        // if (id) {
        //     query['answer.id_question'] = id
        // }
        const data  = await Mongo.GetPilihSiapa([
            {
                '$match': query
            }
        ])
        return data
    }
}

module.exports = new PilihSiapa();