# Smart Cities
The smart cities application is designed to help the city government reach out to its citizens and involve them
in the community development.

## Getting Started

The application is developed with Nativescript alongside with Angular 2, so the first requirement is to have Nativescript [installed](https://docs.nativescript.org/start/quick-setup) 

### Prerequisites
Some of the plugins used by the application require some further configuration. The instrucctions for each one is in their respective githubs repo, this is a list of those plugins:

* [Nativescript google maps sdk](https://github.com/dapriett/nativescript-google-maps-sdk)
* [Nativescript oauth](https://github.com/alexziskind1/nativescript-oauth)
* [Nativescript plugin firebase](https://github.com/EddyVerbruggen/nativescript-plugin-firebase)
* [Nativescript telerik UI](http://docs.telerik.com/devtools/nativescript-ui/getting-started)


Smart Cities needs the following backends:
* [AAA-backend](https://github.com/AltusConsulting/aaa311-backend) for making authentication
* [open311-backend](https://github.com/AltusConsulting/open311-backend) for making community reports.
* [messaging311-backend](https://github.com/AltusConsulting/messaging311-backend) for managing notifications about community reports.

There are some changes you should do before running this project. In your `config.ts` file (located at the shared folder), you should add the URL of the AAA backend, open311 backend and messaging backend.

```typescript
...
 public static aaaApiBase : string = "PUT HERE YOUR AAA-BACKEND URL";
 public static messagingApiUrl = "PUT HERE YOUR MESSAGING-BACKEND URL";

//app settings keys
 public readonly OPEN311_DEFAULT = "PUT HERE YOUR OPEN311-BACKEND URL";
...
```

For testing the open311 and notifications services you could use these URLs in you `config.ts`:
```typescript
...
 public static messagingApiUrl = "https://messaging311.aws.altus.cr";

//app settings keys
 public readonly OPEN311_DEFAULT = "https://open311.altus.cr/api/311/v1";
...
```

### Installing

First clone this repo and with a terminal at its root folder run the command:

```
tns install
``` 

This will add all the dependecies and libraries listed in the package.json


## Deployment

Run the app either with an emulator or a real device, all you need is connecting your device to your machine and execute the following command:

```
tns run android
```
or
```
tns run ios
```

Finally you should create a user for logging to the application, or you could authenticate via Facebook.


## Contributing

...

## Versioning

This is the initial version We use [SemVer](http://semver.org/) for versioning.

## Authors

* [Altus Consulting Software Team](https://github.com/AltusConsulting)

## License

...
