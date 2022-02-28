## Start the app

Due to the time limit, I bootstrapped the client with create-react-app

1. Please install dependencies on both root and /client

```sh
npm install
cd ./client && npm install
```

TODO: If I had more time, this should be fixed to use one command from the root level and install both

2. Start the server and client in development mode from the root level:

```sh
npm start
```

Again, due to the time limit, I worked on the client app directly on the [client/App.tsx](client/App.tsx) file.
If I had more time I would have liked to split out logic handling functions into /utils, and have a /components directory for re-usable components


## Things I would have done, given more time

- Add tests - for both server and client code

- Stronger typing

- Better directory structure

- More granular error handling

- Extract out common parts/logic and unit test those

- Add a devDependencies option to show that

- Graphviz graph beautifying: Placement, make horizontal, colour-code, transitions

- UI states for better UX: Loading, error states

- Work on booting out un-ideal undefined values

- Add prettier and audit tslint/eslint rules