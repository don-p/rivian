import { CarApp } from "./carApp/CarApp";
import { AdminApp } from "./adminApp/AdminApp";

// App has two routes, for vehicle app and admin app.
// Default route at application root is vehicle app.
export const routes = [
  {
    path: "/admin",
    component: AdminApp,
  },
  {
    path: ["/", "/vehicle"],
    component: CarApp
  }
];