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
 * Checks if the token validity is less than x seconds
 * If the token validity is less than x seconds, the token
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

// Checks if keycloak token needs to be refreshed every 10 seconds
setInterval(() => {
    keycloak_token = new Promise(async(resolve) =>{resolve(await refreshToken())})
}, 10000)