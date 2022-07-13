var express = require('express');
var router = express.Router();
var {mongodb, MongoClient, dbUrl} = require('../dbConfig');

/* Create Mentor */
router.post('/creatementor', async(req, res) => {
var client = await MongoClient.connect(dbUrl);
try {
var db = await client.db('assignmentor');
let mentor = await db.collection('mentors').findOne({email:req.body.email});
if(mentor){
  res.send({
    statusCode:404,
    message:"Mentor with same email ID found. Use different email ID!"
  })
}else{
  let add=await db.collection('mentors').insertOne(req.body);
  res.send({
    statusCode:200,
    message:"Mentor added successfully!"
  })
}
}
catch(error){
  res.send({
    statusCode:500,
    message:"Internal server error!"
  })
}
finally{
  client.close();
}
});

/* Create Student */
router.post('/createstudent', async(req, res) => {
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('assignmentor');
  var student=await db.collection('students').findOne({email:req.body.email});
  if(student){
    res.send({
      statusCode:404,
      message:"Student with same email ID found. Use different email ID!"
    })
  }else{
    let add=await db.collection('students').insertOne(req.body);
    res.send({
      statusCode:200,
      message:"Student added successfully!"
    })
  }
  }
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error!"
    })
  }
  finally{
    client.close();
  }
  });

/* Assign a Mentor to a Student */
router.put('/assignmentortostudent/:id', async(req, res) => {
  let id=req.params.id;
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('assignmentor');
  var student=await db.collection('students').findOneAndReplace({_id:mongodb.ObjectId(id)},req.body);  
    res.send({
      statusCode:200,
      message:"Assigned/Changed Mentor to a student successfully!"
    })  
  }
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error!"
    })
  }
  finally{
    client.close();
  }
  });

/* Assign or Change Mentor for a Particular Student */
router.put('/assignchangementorforstudent/:name', async(req, res) => {
  let namecmp=req.params.name;  
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('assignmentor');
  var mentorfind=await db.collection('students').find({mentor:undefined}).toArray();   
  let result=await db.collection('mentors').find({name:namecmp}).toArray();  
  if(mentorfind.length){      
    if(mentorfind.length>1)  
     {       
  await db.collection('mentors').updateOne({name:namecmp},{$set:{students:`${result[0].students},${mentorfind[0].name},${mentorfind[1].name}`}})
  await db.collection('students').updateOne({name:mentorfind[0].name},{$set:{mentor:namecmp}})
   await db.collection('students').updateOne({name:mentorfind[1].name},{$set:{mentor:namecmp}})
    }else{ 
      await db.collection('mentors').updateOne({name:namecmp},{$set:{students:`${result[0].students},${mentorfind[0].name}`}})
      await db.collection('students').updateOne({name:mentorfind[0].name},{$set:{mentor:namecmp}})
    }
    res.send({
      statusCode:201,
      message:"Students added to a mentor successfully!",
      data:result
    })  
  }else{
    res.send({
      statusCode:200,
      message:"All students are assigned with mentors!",
      
    }) 
  }  
     
  }
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error"
    })
  }
  finally{
    client.close();
  }
  });

/* Show all students for a particullar Mentor */
router.get('/showmentorstudents/:name', async(req, res) => {
  let name=req.params.name;
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('assignmentor');
  var mentorfind=await db.collection('students').find({mentor:name}).toArray();  
  if(mentorfind.length){
    res.send({
      statusCode:200,
      message:"Students for that mentor listed successfully!",
      data:mentorfind
      
    })  
  }else{
    res.send({
      statusCode:404,
      message:"No Students are assigned for the mentor!"    
      
    }) 
  }
}
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error"
    })
  }
  finally{
    client.close();
  }
  });



module.exports = router;
