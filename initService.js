const faker = require('faker');
const MongoClient = require('mongodb').MongoClient

module.exports = {
    initDB: function() {
          const users = [{"_id": "user_1", "name": "Krishna", "userType": "basic", "searchOptIn": true, "phone": "90990909090"},
                  {"_id": "user_2", "name": "Hari", "userType": "premium", "searchOptIn": true, "phone": "80808088008"},
                  {"_id": "user_3", "name": "Kumar", "userType": "premium", "searchOptIn": false, "phone": "70770700700"},
                  {"_id": "user_4", "name": "Manoj", "userType": "basic", "searchOptIn": true, "phone": "600606660060"}]

		  const userPets = [{"_id": "user_1_pet_1", "userId": "user_1", "petId": 1}, {"_id": "user_1_pet_2", "userId": "user_2", "petId": 2}, 
		                    {"_id": "user_1_pet_3", "userId": "user_3", "petId": 3}, {"_id": "user_1_pet_4", "userId": "user_4", "petId": 4}]

		  const dbName = 'PetTracking';
		  const url = 'mongodb://localhost:27017'
		  const client = new MongoClient(url, {useNewUrlParser: true,  useUnifiedTopology: true});
		  client.connect(function(err) {
		    const db = client.db(dbName);
		    console.log('Connected successfully to server')
		    createUsers(db, function() {
		      createUserPets(db, function() {
		      	initLocationData(db, function() {
		        	console.log("Closing connection...")
		        	client.close()
		        })
		      })
		    })
		  })

		  const createUsers = function(db, callback) {
		    const usersColln = db.collection('users')
		    usersColln.insertMany(users, function(err, result) {
		      if (err) console.log("Error in inserting Users. Might be they are already present.")
		      else {
		        console.log('Inserted users mock data into the collection')
		        callback();
		      }
		    });
		  };

		  const createUserPets = function(db, callback) {
		    const userPetsColln = db.collection('userPets')
		    userPetsColln.insertMany(userPets, function(err, result) {
		      if (err) console.log("Error in inserting User Pets. Might be they are already present.")
		      else {
		        console.log('Inserted pets mock data into the collection')
		        callback();
		      }
		    });
		  };

		  async function initLocationData(db, callback) {
			    let cnt = 0
			    const userPetsLocationColln = db.collection('userPetsLocation')
			    //await new Promise(resolve => setTimeout(resolve, GET_LOCATION_INTERVAL));
			    let userPets = await db.collection("userPets").find({}).toArray()
			    console.log("Updating Mock Pet Locations " + cnt, userPets.length)
			    //let petLocations = {}
			    let fakeDateLatLongData = []
			    for (let j=0; j<1000; j++) { //j===n-th hour previous to Now
			      const address = faker.address;
			      let addr_lat = parseFloat(address.latitude())
			      let addr_long = parseFloat(address.longitude())
			      for (let i=0; i<userPets.length; i++) {
			        const dateTime = Date.now();
			        let pastDateTime = (dateTime - j*60*60*1000)
			        let addrlat2 = parseFloat((addr_lat - i*0.0005).toFixed(4));  //Simulate neighbors
			        let addrlong2 = parseFloat((addr_long - i*0.0005).toFixed(4)); //Simulate neighbors
			        
			        fakeDateLatLongData.push({"_id": "" + userPets[i].petId + "-" + pastDateTime, "dateTime": pastDateTime, "userId": userPets[i].userId, 
			            "petId": userPets[i].petId, "latitude": addrlat2, "longitude": addrlong2})			        
			      }
			    }

			    userPetsLocationColln.insertMany(
			          fakeDateLatLongData, 
			          function(err, result) {
			            if (err) console.log(err)
			            else {
			              console.log('Inserted mock location into the collection')
			              callback()
			            }
			    })
		  }		  
    }
};