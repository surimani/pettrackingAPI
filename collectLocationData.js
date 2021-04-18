//const _ = require('lodash');
const faker = require('faker');
const MongoClient = require('mongodb').MongoClient


const GET_LOCATION_INTERVAL = 5000;
const dbName = 'PetTracking';
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url, {useNewUrlParser: true,  useUnifiedTopology: true});
client.connect(function(err) {
  console.log('Connected successfully to database')
  updateLocationData()
})



async function updateLocationData() {
    const db = client.db(dbName);
    let cnt = 0
    const userPetsLocationColln = db.collection('userPetsLocation')
    while (true) {
        await new Promise(resolve => setTimeout(resolve, GET_LOCATION_INTERVAL));
        let userPets = await db.collection("userPets").find({}).toArray()
        console.log("Updating Pet Locations " + cnt++, userPets.length)
        //let petLocations = {}
        const address = faker.address
        const addr_lat = parseFloat(address.latitude())
        const addr_long = parseFloat(address.longitude())          
        for (let i=0; i<userPets.length; i++) {
          let addrlat2 = parseFloat((addr_lat - i*0.0005).toFixed(4));  //Simulate neighbors
          let addrlong2 = parseFloat((addr_long - i*0.0005).toFixed(4)); //Simulate neighbors
          const dateTime = Date.now()
          userPetsLocationColln.insertOne(
              {"_id": "" + userPets[i].petId + "-" + dateTime, "dateTime": dateTime, "userId": userPets[i].userId, "petId": userPets[i].petId, 
                "latitude": addrlat2, "longitude": addrlong2}, 
              function(err, result) {
                if (err) console.log(err)
                else {
                  console.log('Inserted location into the collection', dateTime)
                }
          })
        }
    }
}
