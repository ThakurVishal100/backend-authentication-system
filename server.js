import app from "./src/app.js"
import config from "./src/config/config.js"
import connectDb from "./src/config/database.js";

const port=config.PORT || 3000;

connectDb();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})