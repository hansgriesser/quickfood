# Quickfood

Monorepo for **Quickfood**, built with:

- Backend: NestJS + Prisma  
- Frontend: Angular  
- Node.js: 24.x (LTS)

---

## Repository structure
```text
quickfood/
├── apps/
│   ├── api/        # NestJS backend with prisma and all backend feature modules
│   └── web/        # Angular frontend
├── package.json
├── .gitignore
├── .prettierrc
└── README.md
```
- `apps/` contains runnable applications  

---

## Requirements

- Node.js 24.x (LTS)
- npm (comes with Node)

Linux/macOS users may use nvm.  
Windows users can install Node directly or use a version manager like Volta (optional).

---

## Getting started

### Environment variables

Create two `.env` files: one in apps/api and one in apps/web with following content. Replace the secret with a long random string.

Backend (.env in apps/api):

```bash
DATABASE_URL=postgresql://quickfood:quickfood@localhost:5432/quickfood?schema=public
JWT_SECRET=your_jwt_secret
PORT=3000
```

Frontend (.env in apps/web):

```bash
API_URL=http://localhost:3000
```

### Install dependencies (once)

From the repository root, run:

```bash
npm install
```

This installs dependencies for **all apps** via npm workspaces.

---
### First time setup database

If it is the first time running on your device, setup a docker container.

Once you have done that, you can start Prisma. Switch to the folder apps/api, then use

`npx prisma generate` to generate the database resources. After that, use following commands to fill the database with sample data.

```bash
npx prisma migrate dev
npx prisma db seed
```

Now, your database is all set. If you want to have an overview over all tables & data, run `npx prisma studio` in a separate terminal. This will open a web overview similar to pgAdmin. Please use a separate terminal, since this starts a process and the terminal will not be usable after running the command.

### Regular database start

If you have already set up the database and there haven't been changes since your last build, simply start the existing docker container with `docker compose up -d`.


### Run the project

Use following command from the repository root to run the project. This will result in a terminal where frontend and backend are logging in.

```bash
 npm run dev
 ```
   

If you want to separate the logs for front- and backend, feel free to start both from their directory using `npm run start:dev`

for the backend and `ng serve`

for the frontend.

### Other helpful commands

Formatting the whole project

    npm run format

"Linting" the project. Run this with the "--fix" option if you want all auto-fixable problems fixed.

    npm run lint


## Feature overview

The application has three different views.

1. Admin view:

   The admin has a overview, where all generated revenue over the last 7 days is displayed. Admins also have following managing options:

- Global Settings: Service Fee and the Vouchers can be edited. Regarding vouchers, each one has a distinct code that is set by the admin and the discount can be a percentage or a fixed value. Also, Vouchers can have a usage limit or can be set inactive.
- User moderation: since there are chats and forums implemented, users can also be moderated. Concretely, this means that they can be suspended and cannot use the application in the future, until they are unsuspended. Also, they can be warned. For both options, the admin can set a reason.
- Restaurant moderation: Every restaurant has to be approved by an admin, before customers can order. Restaurants can also be set inactive by admins, if there are any problems.
- Delivery Zones: When setting up a new restaurant, the owner has to choose a delivery zone. Those zones are also part of the responsibilities of an admin. Admins can edit existing zones and create new ones. For each zone, a corresponding average delivery time can be set as a service for the user.
- Orders: an admin has overview over all orders with various filter and grouping options for best overview over the business success.
- Dashboard: on the dashboard, an admin can see all important information at one glance: orders, active users, revenue. Also, a log is displayed with recent activity on the app, where logins, warnings, suspension, approvals of restaurants and many more are displayed.
- Security: All admin routes are protected by various guards, so no attacker can access them.

2. User view:

   Customers are offered the experience of a typical order website.

- First, the user is directed to a overview page with all active restaurants. The most important restaurant information is displayed here. Users are allowed to filter by category, name and change the order of the displayed restaurants.
- Every restaurant offers a detail view. Here, additional information on the restaurant is displayed. Users can see the menu and add items to their cart. The user has different navigation options here:
   - go to the Forum: one of our extra features: every restaurant has an additional forum, where questions about the restaurant can be asked and the owner or other users can answer. The owner also has moderation options, see below.
    - go to the cart: if a user has already put items in his cart, a button is displayed that leads to the cart page. Also, in the top right corner, the user can see how many items are already in his cart.
- On the cart page the user has the possibility to edit items in the cart, increase or decrease the number of ordered dishes and completely remove items. If the user is satisfied with his choices, he can click the order-button.
- then he is directed to a quick review page, followed by the choice of payment method (here this choice is non-functional, since it is not a real company).
- If then the order is placed, the user can see a confirmation page where the current order status is displayed and regularly updated.
- Also, the user has the possibility to chat with the owner. This is also one of the extra features implemented in our project, for details see the part below.

3. Owner view:

   Owner can add their restaurants, edit them and have a overview of all orders placed.

- Restaurant creation: for every restaurant, there has to be set a delivery zone, a menu divided in different categories and additional information like email and address. Here is drag-and-drop implemented to simplify the process.
- Existing restaurants can also be overviewed. Every restaurant has the options "manage" and "forum", where the menu and other properties can be edited. The forum button redirects the owner to his own forum page for the corresponding restaurant.
- Orders are viewed on a separate page and filterable by their status. Orders have to be approved by the owner. The owner also has a connection to the order chat here.

4. Common features that every view shares:

- Login / Registration: before using the application, users have to add their profile and register. After a usage break, all users have to login again. The login and registration is handled via JWT.
- All Passwords are only saved hashed (using bcrypt hashes).
- Profile editing: Users can edit their profile name and change their password. For security reasons, any change in credentials will result in a logout and the user has to login again using the new login data.
- Local Storage: for user convenience, tokens, orders and cart values are stored directly on the browser in local storage, that means the user has some kind of offline support and can even logout and login again without losing everything.
- Responsivity: The frontend adapts to the size of your screen, however using a desktop is recommended, since that is what our application is optimized for.
   

### Extra features:

1. Forum:

   The forum is implemented using threads. Every question in the forum is a distinct thread and everything works asynchronous. Whereas users can only ask questions and answer them, owners also have the possibility of closing and deleting questions.

2. Chat:

   The chat is implemented on a websocket basis and works in real time. The user has to start the connection by clicking the chat button on the confirmation page. Once started, the user can also close the chat window and is displayed any unread messages. The owner is listening on all order chats as soon as he opens the order page (which is open all the time when really working with delivery systems).
   Owners are also displayed an unread count, so they can directly answer customers that have questions. However, if the customer does not want to chat, the owner's messages are not even sent to the user, which is a feature to value the customers privacy.

3. Drag and Drop:

   Restaurant owners can upload images per drag and drop to simplify the process of creating new restaurants.

### Location & Delivery Time Simulation

The system implements a zone-based simulation model (Option C from the project addendum).

- Each restaurant belongs to a predefined delivery zone.
- Users are assigned to a zone via their profile.
- Estimated delivery time is derived from:
    - Zone proximity
    - Configured average zone duration
- This value is used for:
    - Restaurant filtering
    - Estimated delivery time display
    - Order confirmation page


## Archtiecture Overview

### Backend (NestJS)

- AuthModule
- UserModule
- OwnerModule
- AdminModule
- OrderModule
- ForumModule
- ChatGateway (WebSocket)

- Architecture pattern:
Controller → Service → PrismaClient → PostgreSQL

### Frontend (Angular)

Feature modules:
- AdminModule
- OwnerModule
- UserModule
- SharedModule

Shared Angular components include:
- Header
- Footer
- Profile page
- Login/Register

Communication:
Angular HttpClient → REST API
WebSocket connection for chat

## REST Endpoints Backend:

All backend routes have the prefix /api and various subroutes, here is only a quick overview of backend endpoints. We used many different options of REST-Endpoints, like GET, POST, PATCH, PUT, DELETE and also query parameters for diverse tasks.

/user: for user management
/restaurant: for fetching restaurant lists for usage in customer view
/owner/restaurant: for fetching restaurants for usage in owner views
/admin: all admin routes are separately protected with a RoleGuard.
/forum: endpoint for forum task
/chat: endpoint for chat task

We use standard HTTP error codes like 404, 500, 403 and more.
There are also different Guards implemented:

1. JwtGuard: only users with a valid JwtToken can use protected routes.
2. RoleGuard: only users with the right role can use protected routes.
3. WsGuard: only users with the right order connection can use the socket connection. 
