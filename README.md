# twitch.tv Rocket League Rank Bot

An express server running inside a docker container.

# Getting started

## Running the server locally

### Install dependencies
```
npm i
```
### Run the server

```
npm start // or node server.js
```

## Building the docker image

Building the image is as easy as running
```
docker build . 
```

If you want to tag your image do this instead
```
docker build . -t yourtag/rankbot
```

## Create a docker container and run the image
```
docker run -p 12345:3000 -d yourtag/rankbot
```
where `12345` is the port you want to be mapped to your host

# StreamElements integration
TBA