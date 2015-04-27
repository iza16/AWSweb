
var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

var task = function(request, callback){	

	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);

	//2. prepare policy
	var policy = new Policy(policyData);

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);
	//4. get bucket name
	var fields = s3Form.generateS3FormFields();	
	fields.push({name: 'x-amz-meta-metadane', value: 'Izabela Borowiecka'});
	fields.push({name: 'x-amz-meta-ip', value: request.connection.remoteAddress});
	var fields2 = s3Form.addS3CredientalsFields(fields,awsConfig);
if(!request.query.bucket){
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:"lab4-weeia"}});
};
console.log(request.query.bucket);
 	if(request.query.key) {
	var params = {Bucket: request.query.bucket, Key: request.query.key};
        s3.getObject(params,function(err, data){
  
        var mdane = data.Metadata;
	var body = data.Body;
	console.log(mdane);
	console.log(body);
	var klucz =  helpers.calculateDigest("md5",body,'hex');
	console.log(klucz);
	callback(null,'<a href="https://s3-us-west-2.amazonaws.com/'+ request.query.bucket+'/'+request.query.key+'">Download</a>' + '<br/>' 
                            +'bucket: ' + request.query.bucket +' <br/>'
		            +'filename: ' + request.query.key +' <br/>'
                            +'etag: ' + request.query.etag +' <br/>'
                            +'hash: '+ helpers.calculateDigest("md5",body,'hex')+' <br/>'
                            +'metadata:' + '<br/>' 
			    +'IP: ' + mdane.ip + '<br/>'
			    +'Uploader: ' + mdane.metadane
                       
		);
});
}}

exports.action = task;
