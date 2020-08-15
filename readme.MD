# Submissions

[Link to the demonstration video](https://www.youtube.com/watch?v=gR71QjbmJvo)

[Link to the presentation slides](https://docs.google.com/presentation/d/1YxOG8uyPY6fy_Q7czGD5bJGpYhFRngDTRjdESdkzCLI/edit?usp=sharing)

[Link to the user manual](https://docs.google.com/document/d/1yM8Fy_c3kIlEPvMYso4nH1ZZVMo2aN-5uhWAhb0Vegk/edit?usp=sharing)

[Link to the demonstration video](https://quaranteams-admin.herokuapp.com/#/login)

[Link to the Psychologist / Staff / Admin Login Page](https://quaranteams-admin.herokuapp.com/#/login)

[Link to The Users(Client) Login Page](https://quaranteams-main.herokuapp.com/login) 

[Link to our humanized chat bot](https://t.me/Quaranteams_bot)

[Link to the DASS-21 Original Question Sets](https://journals.plos.org/plosone/article/file?type=supplementary&id=info:doi/10.1371/journal.pone.0219193.s004#:~:text=The%20Depression%2C%20Anxiety%20and%20Stress,into%20subscales%20with%20similar%20content.)

[Link to the IES-R Original Question Sets](https://www.aerztenetz-grafschaft.de/download/IES-R-englisch-5-stufig.pdf)

[Link to the Backend Main Service](https://github.com/cosmos-ummc/comet)

[Link to the Client Website](https://github.com/cosmos-ummc/mayall)

[Link to the Admin Dashboard](https://github.com/cosmos-ummc/butterfly)

[Link to the Backend Chat Service](https://github.com/cosmos-ummc/needle)

[Link to the Telegram Chat Bot](https://github.com/cosmos-ummc/Willman)

# Instructions

This repository is for the chat backend services. There are several modules included:

- User Personality and Similarity module. 

This module implemented the [recommendationRaccoon](https://github.com/guymorita/recommendationRaccoon#recommendationraccoon-raccoon) library.
This library offers a filtering based recommendation engine that uses the 
Jaccard coefficient to determine the similarity between users and k-nearest-neighbors to identify users who have similar personalities.

- Meeting module

This module implemented a proof of concept of the online meeting room. It used the WebRTC technology to connect two users
from the SAME network to call each other.

- Event emitters module

This module exposed several APIs for the backend main service to trigger chat events. This module uses Pusher API to manage
the socket events.

# Project Setup

- To run the server, first, setup the [Redis Server](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04).

- Install [NodeJS](https://nodejs.org/en/) version v12.14.1. 

- Create a [Pusher](https://pusher.com/) application.

- Next, clone the repository.

- cd to the project directory and run `npm install` to install the dependencies.

- add the environment variables as follows:

```
PUSHER_APP_ID=<Your pusher app id>
PUSHER_CLUSTER=<Your pusher cluster>
PUSHER_KEY=<Your pusher key>
PUSHER_SECRET=<Your pusher secret>
```

- run `npm start` to start the service locally.
