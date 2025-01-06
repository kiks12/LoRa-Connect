# LoRa-Connect Web Application

This is the source code for the web application of the LoRa-Connect ecosystem built with React JS and Next JS. This web application will be deployed on the central node (Command Center) of the LoRa Mesh Network

## Getting Started

After cloning the repository run:
'''bash
npm install
'''

Run Prisma Migrations
'''bash
npx prisma migrate dev --name "Message"

> [!NOTE]
> Make sure that the .env file variables is consistent with your local device

Run Development
'''bash
npm run dev
'''

Then go to [homepage](http://localhost:3000)
