/*
command args
1 - required    - porfile_name      = PROFILE_NAME
2 - required    - threshold         = threshold of number of sandboxes until when the older ones should be deleted
3 - required    - number_to_delete  = fixed number of oldest sandboxes to be delete  
2 - optional    - app_guid          = EMPTY|APP_GUID
*/

const fs = require('fs');
const Axios = require('axios');
const Math = require('mathjs');
const auth = require("./auth");

var workingArgs=[];

var myArgs = process.argv.slice(2);
console.log('Command Options:')
console.log(myArgs)
var myArgsLength=myArgs.length
var i=0;

while ( i < myArgsLength){
    mySplit = myArgs[i].split('=')
    workingArgs[mySplit[0]] = mySplit[1]
    i++;
}


const VeracodeDeleteSandboxes = async (outputFileName) => {

    exit='false'

    //sanity check on commands
    if ( workingArgs['threshold'] && workingArgs['number_to_delete'] ){
        console.log("All parameters are set")
    }
    else {
        console.log('Either "threshold" or "number_to_delete" is not set, but is required, will exit now')
        exit='true'
    }


    if (exit != 'true'){
        //find and set app guid
        if (workingArgs['app_guid']){
            app_guid = workingArgs['app_guid']
        }
        else {
            //find the app guid
            console.log('No APP GUID provided, fnding APP GUID for App Name: '+workingArgs['profile_name'])
            appname = workingArgs['profile_name']
            app_guid = await getAppGUIDbyName(appname)
            console.log('APP GUID found: '+app_guid)
        } 



        //find all sandboxes per profile
        sandboxes = await getSandboxesPerApp(app_guid)
        numberOfSandboxes = sandboxes.length
        console.log(numberOfSandboxes+' Sandboxes found for app profile '+workingArgs['profile_name']+' with guid '+app_guid)
    
        if ( numberOfSandboxes > workingArgs['threshold'] ){
            console.log('Threshold reached, starting to delete old sandboxes')
            console.log('Finding the '+workingArgs['number_to_delete']+' oldest Sandboxes to delete')

            sandboxes.sort((firstItem, secondItem) => firstItem.createDate - secondItem.createDate)

            i=0
            while ( workingArgs['number_to_delete'] > i ){
                console.log('Deleting Sandbox with name "'+sandboxes[i].name+'" from app profile "'+appname+'"')
                deleteMySandbox = await deleteSandbox(sandboxes[i].guid,app_guid)
                console.log(deleteMySandbox)
                i++
            }
        }
        else {
            console.log('Threshold not reached, no need to delete Sandboxes.')
        }
    }
}


var getAppGUIDbyName = async (appname) =>{
        //generate HMAC header
        encodedAppname = encodeURIComponent(appname)
        var options = {
            host: auth.getHost(),
            path: "/appsec/v1/applications?size=100&page=0&name="+encodedAppname,
            method: "GET"
        }
        
        //send request
        try {
            var listIssueResponse = await Axios.request({
              method: 'GET',
              headers:{
                  'Authorization': auth.generateHeader(options.path, options.method),
              },
              url: 'https://api.veracode.com/appsec/v1/applications?size=100&page=0&name='+encodedAppname
            });
            
            apps=listIssueResponse.data._embedded.applications
            appLength=apps.length
            console.log(appLength+' apps found matching the name')

            j=0
            while (j < appLength ){
                if (listIssueResponse.data._embedded.applications[j].profile.name == appname ){
                    return appguid = listIssueResponse.data._embedded.applications[j].guid
                }
                j++
            }
          }
          catch (e) {
            console.log(e)
          }
}

var getSandboxesPerApp = async (app_guid) =>{
    //generate HMAC header
    var options = {
        host: auth.getHost(),
        path: '/appsec/v1/applications/'+app_guid+'/sandboxes',
        method: "GET"
    }

    //send request
    try {
        var listSandboxesResponse = await Axios.request({
          method: 'GET',
          headers:{
              'Authorization': auth.generateHeader(options.path, options.method),
          },
          url: 'https://api.veracode.com/appsec/v1/applications/'+app_guid+'/sandboxes'
        });
        
        sandboxes=listSandboxesResponse.data._embedded.sandboxes
        sandboxesLength=sandboxes.length

        var allSandboxes = []

        k=0
        while (k < sandboxesLength ){
            allSandboxes[k] =
                {
                    'name' : listSandboxesResponse.data._embedded.sandboxes[k].name,
                    'guid' : listSandboxesResponse.data._embedded.sandboxes[k].guid,
                    'createDate' : listSandboxesResponse.data._embedded.sandboxes[k].created,
                    'modified' : listSandboxesResponse.data._embedded.sandboxes[k].modified
                }
            k++
        }
        return allSandboxes
      }
      catch (e) {
        console.log(e)
      }
}


var deleteSandbox = async (sandbox_guid,app_guid) =>{
    //generate HMAC header
    var options = {
        host: auth.getHost(),
        path: '/appsec/v1/applications/'+app_guid+'/sandboxes/'+sandbox_guid,
        method: "DELETE"
    }

    //send request
    try {
        var deletedSandboxResponse = await Axios.request({
          method: 'DELETE',
          headers:{
              'Authorization': auth.generateHeader(options.path, options.method),
          },
          url: 'https://api.veracode.com/appsec/v1/applications/'+app_guid+'/sandboxes/'+sandbox_guid
        });
        
        //console.log(deletedSandboxResponse.data)

        if (deletedSandboxResponse.status = '204 '){
            deleteMessage = ' Sandbox has been deleted'
        }
        else {
            deleteMessage = deletedSandboxResponse
        }

        return deleteMessage
      }
      catch (e) {
        console.log(e)
      }
}






try {
    VeracodeDeleteSandboxes();
} 
catch (error) {
    core.setFailed(error.message);
}

module.exports = {
    Sandboxes: VeracodeDeleteSandboxes,
}