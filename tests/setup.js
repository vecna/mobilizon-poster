var exec = require('child_process').execSync;
const dotenv = require("dotenv")
dotenv.config()
const debug = require('debug')('tests:integration-init');

//assumes docker-compose is running and it's healthy
RUN_IN_CONTAINER="docker-compose -f docker-compose-test.yml exec -T mobilizon "

function deleteMobilizonUser(){
  debug("Deleting Mobilizon User")
  email=process.env.email
  delete_user_command = `mobilizon_ctl users.delete \"${email}\" --assume-yes`
  runCommandSyncInContainer(delete_user_command)
  
}
function createMobilizonUser(){
  try{
    //easier than querying Mobilizon to test if the user already exist and parse the result. It will return an error code if the user exists.
    deleteMobilizonUser()
  }
  catch{
    debug("Delete failed. Probably the user doesn't exist")
  }

  debug("Creating Mobilizon User")
  email=process.env.email
  password=process.env.password
  create_user_command = `mobilizon_ctl users.new \"${email}\" --password \"${password}\"`;
  runCommandSyncInContainer(create_user_command)
}

function runCommandSyncInContainer(command){
  return exec(RUN_IN_CONTAINER+command,
    //forwards the stdout of the command to the console. It makes it easier to troubleshoot but can be disabled. 
    {stdio: 'inherit'}
     );
}

module.exports= async function (globalConfig, projectConfig) {

  //the tests assume the user is present and active when running
  createMobilizonUser()
};