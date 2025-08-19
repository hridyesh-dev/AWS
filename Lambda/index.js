//proper include for the libraries , that we want to have for aws lambda
// we need to define the handler function inside the code , if were passing something we need event here

//once code is written then we need proper dependencies and libraries that are needed for this package
//we need to create a zip file, before that we need to install all the libraries needed for that program

// wee need to import all the proper libraries , 
// we need to import the libraries , need to write lambda handlers function 
// we need to use event if we're passing something

export const handler=async (event)=>{
    
    console.log("lambda function Started : ");
    // to see what event we have received what triggered the lambda function
    console.log("Event received : ",JSON.stringify(event));

    const response={
        statusCode:200,
        //WHAT WE ARE SENDING IN RESPONSE
        body:JSON.stringify({
            message:"Hello from lambda made in VS CODE !",
            timeStamp:new Date().toISOString()
        })
    }

    //KYA RESPONSE MILL RAHA HAI
    console.log("this is the response we are sending  :",response);

    return response

}