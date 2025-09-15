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


1. .env.template should be generated as we select modules
2. FOr database entities entites should be in folder above src i.e. database. Inside that entities should hold all entities and repositories will have all respositoried for respective entities. 
3. Have user selection if primary generated column should be uuid or simple int
4. Each module will inject repository directly as @db/repositorie/<name of repo>


1. Now implement redis layer to store refresh token and add good and solid auth system. 

"Create a clean, minimal, and highly aesthetic UI using shadcn/ui components. The design should feel modern and professional, inspired by Vercel’s design language – dark theme by default, smooth rounded corners, subtle gradients, and elegant typography. Use a lot of white space cards, and animated transitions with Framer Motion for a premium feel.

The layout should follow a grid-based system, with balanced proportions and spacing. Focus on simplicity and elegance: avoid clutter, use no shadows, and ensure the components (cards, buttons, inputs, modals, navbars) look sleek, polished, and consistent.