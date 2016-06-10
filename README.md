# [davo.io](https://davo.io)

Manage your HTTP traffic

## Features

  * Multiple body renderings
  * Resend
  * Powered by Troxy

## Development

  * Install dependencies with `mix deps.get; npm install`
  * Start Phoenix endpoint with `mix phoenix.server`
  * ...or start **interactive** Phoenix endpoint with `iex -S mix phoenix.server`

Now open the ui visiting [`localhost:4000`](http://localhost:4000), then set your device HTTP proxy to localhost:4000 and start managing your HTTP traffic.

## Ideas

  - Generate JSON Schema, RAML, Swagger
  - API.Adapters
    + JSON Schema
    + RAML
    + API Blueprint
    + Swagger
  - Auth.Adapters
    + OAuth1
    + OAuth2
    + https://getkong.org/plugins/#authentication

## Inspired on

 - mitmproxy, charles
 - HTTP clients like curl, postman, paw
 - ngrok, localtunnel
