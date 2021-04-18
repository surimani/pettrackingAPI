const express = require('express');
const faker = require('faker');
const _ = require('lodash');
const app = express();
const initService = require("./initService.js");

const MongoClient = require('mongodb').MongoClient
const dbName = 'PetTracking';
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url, {useNewUrlParser: true,  useUnifiedTopology: true});

app.get('/initdb', (req, res) => {
    initService.initDB()
    res.send("SUCESSS")        
})

app.get('/showhistory', async (req, res) => {
    let duration = req.query.duration ? req.query.duration : 24 //Specifu duration in hours, for 30 days=720 hours
    let userId = req.query.userid
    let pageLimit = req.query.limit ? req.query.limit : 10 //Limit number of records per page to 10 (default) //TBD: Pagination
    await client.connect(async function(err) {
        const db = client.db(dbName);
        console.log('Connected successfully to DB')
        let foundUsers = await db.collection('users').find( { "_id": userId } ).toArray()
        let user = foundUsers[0]
        //console.log(foundUsers)
        const currDateTime = Date.now()
        if (!user) {
          res.send("Invalid user.")
        } else if (user.userType == "basic") {
          if (duration > 24) res.send("BASIC Users can only see data of last 24 hours. Please upgrade to premium to see data of more duration.")  
          else {
            let foundPets = await db.collection('userPetsLocation').find( { "userId": userId, "dateTime": { "$gt": (currDateTime - duration*60*60*1000) } }  ).toArray()
            res.send({"locationData" : foundPets})  
          }
        } else if (user.userType == "premium") {
          if (duration > 720) res.send("You can only see data of last 30 days.")
          else {
            let foundPets = await db.collection('userPetsLocation').find( { "userId": userId, "dateTime": { "$gt": (currDateTime - duration*60*60*1000) } }  ).toArray()
            res.send({"locationData" : foundPets})
          }
        }
    })          
})

app.get('/shownearest', async (req, res) => {
  let radius = req.query.radius ? req.query.radius : 5 //Default radius value of 5 miles
  let nearWhen = req.query.when ? req.query.when : 1 //Nearest in the last recorded one hour (default value)
  let pageLimit = req.query.limit ? req.query.limit : 10 //Limit number of records per page to 10 (default) //TBD: Pagination
  let userId = req.query.userid
  await client.connect(async function(err) {
        const db = client.db(dbName);
        console.log('Connected successfully to DB.')
        let foundUsers = await db.collection('users').find( { "_id": userId } ).toArray()
        let user = foundUsers[0]
        if (!user) {
          res.send("Invalid user.")
        } else if (user.userType == "basic") {
          res.send("Cannot show nearest pets to basic users.")  
        } else if (user.userType == "premium") {
          let latestPet = await db.collection('userPetsLocation').find({"userId": userId}).sort({dateTime: -1}).limit(1).toArray()
          //console.log(latestPet[0])
          let latestLat = parseFloat(latestPet[0].latitude)
          let latestLong = parseFloat(latestPet[0].longitude)
          let minLatitude = latestLat - (radius/69)
          let maxLatitude = latestLat + (radius/69)
          let minLongitude = latestLong - (radius/69*((Math.cos(Math.PI*latestLat/180))))
          let maxLongitude = latestLong + (radius/69*((Math.cos(Math.PI*latestLat/180))))
          minLatitude = parseFloat(minLatitude.toFixed(4))
          maxLatitude = parseFloat(maxLatitude.toFixed(4))
          minLongitude = parseFloat(minLongitude.toFixed(4))
          maxLongitude = parseFloat(maxLongitude.toFixed(4))
          //console.log(latestLat, latestLong)
          //console.log(minLatitude, maxLatitude, minLongitude, maxLongitude)
          let petLocations = await db.collection('userPetsLocation').find({ "dateTime": { "$gt": (latestPet[0].dateTime - nearWhen*60*60*1000) },
             "latitude": { "$gte" :  minLatitude, "$lte" : maxLatitude}, "longitude": { "$gte" :  minLongitude, "$lte" : maxLongitude}
          }).toArray()
          //Location can be further refined to a much more granular level using other formulae

          let contactDetails = []
          let uniqueUserIds = {}
          for (let i=0; i<petLocations.length; i++) {
              if (uniqueUserIds[petLocations[i].userId]) continue;
              let foundUsers = await db.collection('users').find( { "_id": petLocations[i].userId } ).toArray()
              let user = foundUsers[0]
              if (user.searchOptIn) {
                contactDetails.push({"userId": petLocations[i].userId, "name": user.name, "phone": user.phone})
                uniqueUserIds[petLocations[i].userId] = 1;
              }
          }
          //console.log(petLocations)
          res.send({"contactDetails" : contactDetails})
        }
    })
})
app.listen(8080, () => {
  console.log('server started on port 8080');
});