console.log(JSON.stringify({
  "hooks":{
    "doctor":"npx -q --no-install -p @slack/cli-hooks slack-cli-doctor",
    "check-update":"npx -q --no-install -p @slack/cli-hooks slack-cli-check-update",
    "get-manifest":"npx -q --no-install -p @slack/cli-hooks slack-cli-get-manifest",
    "start":"npm start"
  },
  "config":{
    "watch":{
      "app":{
        "filter-regex":"\\.(js|ts|json)$",
        "paths":["."]
      },
      "manifest":{
        "paths":["manifest.json"]
      }
    },
    "protocol-version":["message-boundaries"],
    "sdk-managed-connection-enabled":true
  },
  "runtime":"node"
}));
