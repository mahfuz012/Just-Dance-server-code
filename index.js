const express = require('express')
const app = express()

// var jwt = require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config()
// const stripe = require("stripe")(process.env.PAYMENT_SECRET)


const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSCODE}@cluster0.scwz6ce.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});







async function run() {
  try {
   
    await client.connect();
   


    const allUserCollection = client.db("just-dance").collection("user-collection")





// admin panel and need privacy
  app.get("/usergetid", async(req,res)=>{
       const result = await allUserCollection.find().toArray()
      res.send(result)
      })



//is admin or not 
app.get('/admin/find/:email', async (req, res) => {

  const getParams = req.params.email
  const findID = { email: getParams }

const isvalidAdmin = await allUserCollection.findOne(findID)
   

  const result = {admin:isvalidAdmin?.role}
  
  res.send(result)
})


//is Instructor or not
app.get('/instructor/find/:email', async (req, res) => {

  const getParams = req.params.email
  const findID = { email: getParams }

const validAdmin = await allUserCollection.findOne(findID)
   
  const result = {admin:validAdmin?.role === "instructor"}
  
  res.send(result)
})




















   app.post("/alluserid", async(req,res)=>{
   const getData = req.body
    const duplicateEmail = {email: getData.email}
    const findData = await allUserCollection.findOne(duplicateEmail)
    if(findData){
      return res.status(400).send({ message: "Data already exists" });
    }

     const result = await allUserCollection.insertOne(getData)
   res.send(result)
   })



   app.patch('/update/admin/:id',async(req,res)=>{
    const getId = req.params.id
    const findData = {_id: new ObjectId(getId)}

    const makeAdminUser = {

      $set: {
          role: "admin"
      }
  }

const result = allUserCollection.updateOne(findData,makeAdminUser)
res.send(result)
})



 app.patch('/update/instructor/:id',async(req,res)=>{
    const getId = req.params.id
    const findData = {_id: new ObjectId(getId)}

    const makeAdminUser = {

      $set: {
          role: "instructor"
      }
  }

const result = allUserCollection.updateOne(findData,makeAdminUser)
res.send(result)
})






















    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
   
  }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})