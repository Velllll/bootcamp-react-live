# MineCite 

## Setup 

create .env file 

`touch .env`

`cat >> .env`

Fill .env file with: 
<br>
DB_NAME=api
<br>
DB_USER={USERNAME}
<br>
DB_PASSWORD={PASSWORD}
<br>
DB_HOST=db

## Start in dev mode

Start backend and bd
`docker-compose up --build -d`

<br>

For start frontend `cd front` and `ng serve`

## Start in prod 

`docker-compose -f docker-compose-prod.yaml up -d --build`