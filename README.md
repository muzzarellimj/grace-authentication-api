# Grace Authentication API

The Grace Authentication API makes available an HTTP web server with a REST API, serving authentication to the [Grace](https://github.com/muzzarellimj/grace) client applications. This API is written in [Node](https://nodejs.org/en) with [TypeScript](https://www.typescriptlang.org/) and uses the [Express](https://expressjs.com/) web framework.

## Examples

After this repository has been cloned, the dependencies fetched, and the web server started, a few prepackaged example requests can be made. For example...

```
curl --request POST \
  --url http://localhost:3000/api/ex/auth/create \
  --header 'Content-Type: application/json' \
  --data '{
	"email": "foo@bar.com",
	"password": "password"
}'
```

... should garner response ...

```
A user was signed in with the email-password Firebase authentication module.
```

Additional example requests can be found under the `/api/ex/...` endpoints and are handled by functions found in the [example/](src/example/) subdirectory.
