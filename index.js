const express = require('express')
const app = express()

var jwt = require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config()
// const stripe = require("stripe")(process.env.PAYMENT_SECRET)


const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())




const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization) {
      return res.status(401).send({ error: true, message: "authorxation access" })
  }

  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ error: true, message: "authorxation access" })
      }
         req.decoded = decoded

      next();
  })

}



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
    const allClassesData = client.db("just-dance").collection("class-collection")







    const verifyAdmin = async(req,res,next)=>{
      const email= req.decoded.email 
      const query = {email: email}
      const user = await allUserCollection.findOne(query)
      if( user?.role !== "admin" ){
           return res.status(403).send({error:true})
      }
      
      next()
  }
  







// all user id and admin panel and need privacy
  app.get("/usergetid",verifyJWT,verifyAdmin, async(req,res)=>{
       const result = await allUserCollection.find().toArray()
      res.send(result)
      })

// all intructor class add files here and it only show by admin

  app.get("/allclasses",verifyJWT,verifyAdmin, async(req,res)=>{
       const result = await allClassesData.find().toArray()
      res.send(result)
})

  app.get("/myclassesdata", async(req,res)=>{
        const getData = req.query.email 
        const findInstructorClass = {email:getData}
       const result = await allClassesData.find(findInstructorClass).toArray()
      res.send(result)
      })






//is admin or not 
app.get('/admin/find/:email',verifyJWT,async (req, res) => {

  const getParams = req.params.email
  const findID = { email: getParams }

const isvalidAdmin = await allUserCollection.findOne(findID)
   

  const result = {admin:isvalidAdmin?.role}
  
  res.send(result)
})















app.post('/jwt', (req, res) => {
  const user = req.body
   const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' })
  res.send({ token })
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



  //  add class add 
app.post("/addclassdata", async(req,res)=>{
  const getData= req.body
  const result = await allClassesData.insertOne(getData)
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

const result = await allUserCollection.updateOne(findData,makeAdminUser)
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

const result = await allUserCollection.updateOne(findData,makeAdminUser)
res.send(result)
})






 app.patch('/approvedupdate/:id',async(req,res)=>{
    const getId = req.params.id
    const getbody= req.body
    const findData = {_id: new ObjectId(getId)}

    const makeAdminUser = {

      $set: {
          status: getbody.declare
      }
  }

const result = await allClassesData.updateOne(findData,makeAdminUser)
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