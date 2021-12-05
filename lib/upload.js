const _ = require('lodash');
const fs = require('fs');
const fetch = require('node-fetch');
const debug = require('debug')('uploader');
const nconf = require('nconf');

nconf.argv().env().file({file: "config.json"});

const uploadFile = JSON.parse("{\"query\":\"mutation($file: Upload!, $name: String!){uploadMedia(name: $name, file: $file, alt:null){id}}\"}");
//uploadFile.operationName = "uploadMedia";
uploadFile.variables = {                                            
  file: null,
  name: 'upload-test-api.png'
};


async function uploadToMobilizon(filevars) {
    console.log('test output: %s', filevars.path);
    console.log('test output: %s', filevars.name);
    uploadFile.variables.file = filevars.path;
    uploadFile.variables.name = filevars.name;
    uploadFile.thefile = "@{" + filevars.path + "}";
    console.log(JSON.stringify(uploadFile));
    const response = await fetch(nconf.get('api'), {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": "Bearer " + nconf.get('token'),
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1"
        },
        "referrerPolicy": "same-origin",
        "body": JSON.stringify(uploadFile),
        "method": "POST",
        "mode": "cors"
    });

    let responseBody = null;
    try {
        responseBody = await response.json();
	debug(responseBody);
	console.log("response: %j", responseBody);
    } catch(error) {
        console.log(".json decode error?", error);
        process.exit(1)
    }

}

//const { exec } = require('child_process');
//exec('bash /home/tomm/projects/mobilize.berlin/mobilizon-poster/uploader.sh test-image /home/tommy/im.png', (err, stdout, stderr) => {
//  if (err) {
    //some err occurred
//    console.error(err)
//  } else {
   // the *entire* stdout and stderr (buffered)
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);
//  }
//});

module.exports = {
    uploadToMobilizon,
}
