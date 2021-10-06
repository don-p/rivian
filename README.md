# rivian code challenge

## Running the project

1. Ensure a recent version of npm/node is installed.
2. Fetch the code from https://github.com/don-p/rivian.git (two branches exist, for each of the deliverables: `delieverable1`, `delieverable2`).
3. Two terminal windows are required, to run two processes for the server and client (admin/vehicle) applications.
4. Open a new terminal window for the server application, at the root of the local git project. Run `npm install`, and then `npm start`.
5. You should see a console message echoed showing "node src/server.js" when the application server has started.
6. Open a new terminal window for the client application, and from the root of the local git project, cd to the `/client` directory.  In this directory, run `yarn install`, and then `yarn start`.
7. You should see a console message that the client application is available at http://localhost:3000, when the client application server has started.
8. The "admin" app is available at localhost:3000/admin.  This app displays a list of connected vehicles and their status properties.
9. The "car" app is available at localhost:3000/vehicle.  This app displays the vehicle status properties.
10. Open one browser window with the "admin" app at localhost:3000/admin, and two browser windows with the "car" app at localhost:3000/vehicle.
11. The "admin" app should display a list of two cars; each car app should display its current status.  Both apps should display one car as the "pace car", and should update the car speed and location every 5 seconds.  If a car is disconnected (using the "Disconnect" button in the car app), a new pace car should be selected, as seen on both the admin and car apps.  Reconnecting the disconnected car should show that it is no longer the "pace car" and should re-start the car with its current status (which has been updating locally while disconnected).
12. The admin app will show, in addition to the car's status, a button for "Horn".  This will honk the horn on the selected car's client app.  In order for this remote-control to work, on the car app, the "Enable control" button nust first be clicked (this is due to a constraint on JavaScript that media playback can't be initiated programmatically without a user directly interacting with the page first).

