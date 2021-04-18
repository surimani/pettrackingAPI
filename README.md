# pettrackingAPI  


Steps for installing and running the application.  

1. Install Mongo DB and configure its data folder.  
2. Install NodeJS and start NodeJS Server using the command "node index.js".  
3. Hit http://localhost:8080/initdb to initialize database with Mock data.  
4. Start Location Collection Service by running collectLocationData.js.  
5. Check Pet's Location History using http://localhost:8080/showhistory?userid=user_3 (user_id is used instead of actual authentication for now).  
6. Check Nearest Pet's Owner Contact Details using http://localhost:8080/shownearest?userid=user_3 (user_id is used instead of actual authentication for now).  

TBD: Authentication, Pagination  

Assumptions:   
1. Using custom algo for calculating nearest Pet Locations to improve speed. General formula to calculate distances between two locations is very slow if data is huge.  
2. Can migrate to cloud services at a later stage if required.  
3. Authentication is done by just passing userid/apikey in the query param. Can implement OAuth based Authentication at a later stage.  
	