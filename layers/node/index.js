// Final version with Sharp for thumbnail generation
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// S3 service object: buckets se interact karne ke liye  
const s3Client = new S3Client({ region: 'eu-north-1' }); // Stockholm region

// Helper function to convert stream to buffer
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// main handler 
exports.handler = async (event) => {
  console.log("s3 ka event : ", event);

  // s3 event record will be in event.record[0]
  // bucket name extract krr liya
  const bucket = event.Records[0].s3.bucket.name;

  // filename or path of file uploaded on s3
  // key sirf file ka naam ya uska path hota hai jo S3 bucket mein store hoti hai
  // decoding it for correct processing
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  // FILE INFO
  console.log(`Processing file: ${key}, bucket name: ${bucket}`)

  // destination bucket ka naam
  const destinationBucket = 'thumbnail-image-bucket-hri'

  // abb image compression start
  try {

    // s3 se data aaya 
    console.log('Fetching object from S3...');
    
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await s3Client.send(getCommand);
    
    // Convert stream to buffer
    const originalBuffer = await streamToBuffer(response.Body);

    console.log(`Original image size: ${originalBuffer.length} bytes - processing start hone lagi hai...`);
    
    // Step 2: Resize the image using Sharp library for thumbnail
    const thumbnailBuffer = await sharp(originalBuffer)
                          .resize({ 
                            width: 150,      // thumbnail width
                            height: 150,     // thumbnail height
                            fit: 'cover'     // aspect ratio settings
                          })
                          .jpeg({ quality: 80 }) // compression quality
                          .toBuffer();         // Convert to buffer for uploading
        
    console.log(`Thumbnail created! Original: ${originalBuffer.length} bytes → Thumbnail: ${thumbnailBuffer.length} bytes`);
    
    const thumbnailFileName = `thumbnail-${key}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: destinationBucket, // thumbnail kaha store hogi
      Key: thumbnailFileName, // thumbnail file name
      Body: thumbnailBuffer, // resized thumbnail image
      ContentType: 'image/jpeg', // headers
      Metadata: { // meta-data track karne ke liye
          'original-key': key, // Original file ka naam
          'original-bucket': bucket, // Original bucket ka naam
          'original-size': originalBuffer.length.toString(), // Original size
          'thumbnail-size': thumbnailBuffer.length.toString(), // Thumbnail size
          'created-at': new Date().toISOString()  // When thumbnail was created
      }
    });
    
    await s3Client.send(putCommand);

    console.log(`✅ Thumbnail successfully created: ${thumbnailFileName} in bucket: ${destinationBucket}`);
        
    // successful execution ho gaya
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Thumbnail generated successfully! 🎉',
            originalKey: key,
            thumbnailKey: thumbnailFileName,
            originalBucket: bucket,
            destinationBucket: destinationBucket,
            originalSize: originalBuffer.length,
            thumbnailSize: thumbnailBuffer.length,
            compressionRatio: `${Math.round((1 - thumbnailBuffer.length/originalBuffer.length) * 100)}% smaller`
        })
    };
  } catch(error) {
    
    console.log("koi error aa gaya:", error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'error generating thumbnail',
        error: error.message,
        stack: error.stack,
        key: key,
        bucket: bucket
      })
    }
  }
};