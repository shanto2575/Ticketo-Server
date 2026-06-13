const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv')
dotenv.config()

const uri = process.env.MONGODB_URI;

const port = process.env.PORT;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // await client.connect();

        const db = client.db('Ticketo')
        const organizationCollection = db.collection('organization')
        const usersCollection = db.collection('user')
        const eventsCollection = db.collection('events')
        const bookingsCollection = db.collection('bookings')


        //Organization
        app.get('/api/organization/:email', async (req, res) => {
            const { email } = req.params;
            const result = await organizationCollection.findOne({ organizerEmail: email })
            res.json(result)
            //console.log(result)
        })


        app.post('/api/organization', async (req, res) => {
            const { organizationName, logo, website, description, organizerEmail } = req.body;
            const addData = {
                organizationName,
                logo,
                website,
                description,
                organizerEmail,
                createdAt: new Date(),
                status: 'active'
            }
            const result = await organizationCollection.insertOne(addData)
            // console.log(result,'re')
            res.json(result)
        })

        app.patch('/api/organization/:id', async (req, res) => {
            const { id } = req.params;
            const { organizationName, logo, website, description, organizerEmail } = req.body;
            const updateData = {
                organizationName,
                logo,
                website,
                description,
                organizerEmail,
                createdAt: new Date(),
                status: 'active'
            }
            const result = await organizationCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        ...updateData
                    }
                }
            )
            // console.log(result,'re')
            res.json(result)
        })

        //..........Events................

        app.get('/api/events',async(req,res)=>{
            const cursor=eventsCollection.find()
            const result=await cursor.toArray()
            res.json(result)
        })

        app.get('/api/single-events/:id',async(req,res)=>{
            const {id}=req.params;
            const result=await eventsCollection.findOne({_id:new ObjectId(id)})
            res.json(result)
        })
        app.get('/api/events/:email', async (req, res) => {
            const { email } = req.params;
            const result = await eventsCollection.find({ OrganizationEmail: email }).toArray()
            res.json(result)
        })

        app.post('/api/events', async (req, res) => {
            const data = req.body;
            // console.log(data)
            const organizer=await usersCollection.findOne({email:data?.OrganizationEmail})
            // console.log(organizer)
            const OrganizerEventCount=await eventsCollection.countDocuments({OrganizationEmail:data?.OrganizationEmail})
            // console.log(OrganizerEventCount)
            if(!organizer?.isPremium && OrganizerEventCount >=3){
                res.status(401).send({
                    message:'Your Limit is Over'
                })
            }
            const result = await eventsCollection.insertOne({
                ...data,
                status:'pending'
            })
            // console.log(result,'re')
            return res.json(result)
        })

        app.patch('/api/events/:id', async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const result = await eventsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        ...updateData
                    }
                }
            )
            res.json(result)
        })

        app.delete('/api/events/:id',async(req,res)=>{
            const {id}=req.params;
            const result=await eventsCollection.deleteOne({_id:new ObjectId(id)})
            res.json(result)
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})