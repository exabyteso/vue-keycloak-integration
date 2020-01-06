# vue-keycloak-integration-tutorial

Keycloak is a useful open source library for Identity and Access Management. This tutorial focuses on how Keycloak can be integrated with javascript specifically the Vue framework.

## Prerequisites

1. Ubuntu 16.04 and above
2. NPM
3. Vue

## Add the official Keycloak Javascript adapter

Version 6.0.1 is preferred as it's the most stable as of the writing of this tutorial

```
    npm i keycloak-js@6.0.1 --save
```

## Specify the initialization options

- Keycloak host URL - Keycloak server URL (required)
- Realm Name - secures and manages security metadata for a set of users, applications, and registered oauth clients (required)
- Client ID - ID of client belonging to realm (not required)
- On Load - specifies an action to do on load. Supported values are 'login-required' or 'check-sso' (required)

The standard Keycloak APIs init call returns a promise. Render the Vue application after the Keycloak token has been returned successfully to prevent exposing any Vue resource before authentication is complete.

One of the challenges you will face when using Keycloak is the fact that it relies heavily on callbacks meaning that you will need to nest these callbacks in promises to improve scalability and reliability of your implementation of the package.

**Keycloak.js**
```
    /**
     * Keycloak configs
     * Keycloak javascript adapter documentation available at 
     * https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/oidc/javascript-adapter.adoc
     * 
     */
    const Keycloak = require('keycloak-js')
    let initOptions = {
      url: 'my-keycloak-server-url',
      realm: 'my-realm',
      clientId: 'my-client-id',
      onLoad:'login-required'
    }
    
    /**
     * Checks if the token validity is less than 120 seconds
     * If the token validity is less than 120 seconds, the token
     * is updated
     * If the token has been refreshed successfully the onAuthRefreshSuccess
     * event is called, and the promise is resolved with the new token
     * If the token has not been refreshed successfully the onAuthRefreshError
     * event is called, and the promise is rejected with "", and the token cleared
     */
    async function refreshToken(){
        if(!keycloak.isTokenExpired(120))
            return keycloak.token
        keycloak.updateToken(120)
        return new Promise((resolve, reject) => {
            keycloak.onAuthRefreshSuccess = () => resolve(keycloak.token)
            keycloak.onAuthRefreshError = () => {
                console.error("Failed to refresh token")
                keycloak.clearToken()
                keycloak.logout()
                reject("")
            }
        })
    }
    
    export var keycloak = Keycloak(initOptions)
    
    /**
     * Create the initial token
     * Wraps keycloak callbacks into a promise that can be
     * awaited which helps to improve reliability
     */
    export var keycloak_token = new Promise((resolve) => {
        keycloak.init({ onLoad: initOptions.onLoad })
        .success((auth) =>{
            console.log(auth ? "Authenticated" : "Not Authenticated")
            setTimeout(async() => {resolve(await refreshToken())}, 2000)
        })
        .error(() =>{
            console.log("Authentication failed")
            resolve("")
        })
    })
    
    // Checks if keycloak token needs to be refreshed every 10 seconds to prevent instances
    // where an API call fails cause the token is obsolete
    setInterval(() => {
        keycloak_token = new Promise(async(resolve) =>{resolve(await refreshToken())})
    }, 10000)
```

## Making API calls with the Keycloak token
```
    import Axios from 'axios'
    import {keycloak_token} from './keycloak.js'
    
    var results = Axios.get(`https://my-url.com`, { headers: { authorization: `Bearer ${await keycloak_token}` } })
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.log(error)
      return null
    })
```

# Running this project

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
