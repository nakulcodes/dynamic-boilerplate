1. Add short path for bolier plate on database and utils
2. Add comon function like pagination utility, response intercetors for global format handling
3. Add swagger api docs for boilerplate


1. For env access used configService instead of directly process.env. 
2. All module for backend should be under src/modules/
3. Add mail modules resend and smtp which can be selected on boilerplate generation


1. Mail service will have basic method like send mail and all with generated template besing set as argument. Think in such a way. And update mail service accordingly. We will have template in our db entity for storing templates for message like mail, whatsapp, messsage and we will popeulate variable in that so mail service will reieve template id and variable
2. Add login for github and outlook in same project. 


1. Add health check module
2. Add file module like s3 aws
3. Add notifications send using twillio
4. Add stripe module