// Load the SDK and UUID
const AWS = require('aws-sdk');
const uuid = require('uuid');
const fs = require('fs');

const aws = {
    accessKeyId: "AKIA3EN3S2OCLDY4HTKH",
    secretAccessKey: "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",
};
 
AWS.config.credentials = {
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
};

AWS.config.region = "eu-central-1";

const s3 = new AWS.S3();

// s3.listBuckets(function(err,data){
//     if(err){console.log(err);}
//     else{console.log (data);}
//     });

module.exports = {
    upload(fileName) {
        const bucketName = uuid.v4();
        const fileContent = fs.readFileSync(fileName);
        const params = {
            Bucket: bucketName,
            Key: fileName, // File name you want to save as in S3
            Body: fileContent
            };
        
        console.log(params)
        // //const bucketPromise = s3.createBucket(params).promise();
        const bucketPromise = s3.createBucket({Bucket: bucketName}).promise();

        //Uploading files to the bucket
        bucketPromise.then(
            function(data) {
                const uploadPromise = s3.putObject(params).promise();
                uploadPromise.then(
                    function(data) {
                        console.log("Successfully uploaded data to " + bucketName + "/" + fileName);
                    });
            }
        )
    },
    download(params) {
        const downloadPromise = s3.getObject(params).promise();
        downloadPromise.then(
            function(data) {
                const filePath = './' + params.Bucket + '_' + params.Key   //'./downloaded.txt'
                //console.log(filePath)
                //console.log(data.Body.toString())
                fs.writeFileSync(filePath, data.Body.toString());
                console.log(filePath,' has been created!');
            })
    }
}
//upload('hi.text')
// const params = {
//     Bucket: 'b312bde0-db8b-4795-ae98-017ee1e5f75f',
//     Key: 'hi.text'
// }
// download(params)