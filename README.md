# pettrackingAPI  


Steps for installing and running the application.  

1. Install Mongo DB and configure its data folder.  
2. Install NodeJS and start NodeJS Server using the command "node index.js".  
3. Hit http://localhost:8080/initdb to initialize database with Mock data.  
4. Start Location Collection Service by running collectLocationData.js.  
5. Check Pet's Location History using /showhistory?userid=user_3 (user_id is used instead of actual authentication for now).  
6. Check Nearest Pet's Owner Contact Details using /shownearest?userid=user_3 (user_id is used instead of actual authentication for now).  

TBD: Authentication, Pagination  