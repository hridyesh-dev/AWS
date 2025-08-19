import { handler } from "./index.js";

const testEvent={
    name:"Hridyesh",
    action:"Test local",
    source:"VS CODE"
}

console.log("Testing Lambda function locally...");

handler(testEvent).then((result)=>{
    console.log("test completed sucessfully");
    console.log("The result is : ",result);
    
}).catch((error)=>{
    console.log("testing failed");
    console.log("Error :",error);
})




