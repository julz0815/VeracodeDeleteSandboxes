# Veracode - Delete Sandboxes via threshold 

## About

this little Java Script will automatically delete Sandboxes from a profile via a configured threshold and the number of Sandboxes to be deleted  
 
## Instructions  
  
- Copy the VeracodeDeleteSandboxes.js and package.json file into your repository or locally  
- run npm run delete-sandboxes with required command arguments  
- npm delete-sandboxes profile_name=Sandboxes threshold=4 number_to_delete=5
  
  
## Command arguments delete sandboxes
The script takes up to 4 command line arguments to achieve different things  
  
1 - required    - profile_name      = PROFILE_NAME  
2 - required    - threshold         = threshold of number of sandboxes until when the older ones should be deleted  
3 - required    - number_to_delete  = fixed number of oldest sandboxes to be delete    
4 - optional    - app_guid          = EMPTY|APP_GUID  


Set your Veracode platform application profile name along with a threshold, once reached, deleteing the number of oldest sandboxes, ordered by created date, set via the "number_to_delete" parameter.     
  
## General Settings  
Veracode Credentials  
Select Settings > CI/CD > Variables.  
Set these environment variables:  
API_ID: your Veracode API ID from the Veracode Platform  
API_KEY: your Veracode API Secret Key from the Veracode Platform  
  
  
  



