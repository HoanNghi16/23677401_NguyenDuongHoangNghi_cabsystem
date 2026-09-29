# cab_system --- Development Context

## 1. Project overview

`cab_system` is a school smart ride-booking application built with a
microservices architecture.

Main stack/conventions: - Backend: ExpressJS + TypeScript - Services may
use PostgreSQL or MongoDB depending on the bounded context - External
client communication: REST/HTTPS - Internal synchronous communication:
gRPC - Internal asynchronous communication: Kafka Pub/Sub - Each service
owns its own database - API Gateway sits between client and internal
services

## 2. Bounded Contexts / Services

The current bounded contexts are:

1.  Customer
2.  Booking --- includes booking + riding/dispatch/fare calculation
3.  Trip
4.  Driver --- includes driver + vehicle
5.  Payment
6.  Notification
7.  Auth --- identity & access

Current root structure:

``` text
cab_system/
├── api-gateway/
├── services/
│   ├── auth-service/
│   ├── customer-service/
│   ├── booking-service/
│   ├── trip-service/
│   ├── driver-service/
│   ├── payment-service/
│   └── notification-service/
├── proto/
├── infrastructure/
│   └── docker-compose.yml
├── docs/
├── package.json
├── README.md
└── .gitignore
```

## 3. Communication architecture

This has been explicitly decided:

### External

``` text
Client
  │ REST/HTTPS
  ▼
API Gateway
```

### Internal synchronous

Use **gRPC** when a service needs data/response immediately.

``` text
API Gateway
    │ gRPC
    ▼
Service
```

and:

``` text
Service A
    │ gRPC
    ▼
Service B
```

Example: Booking needs to find an available driver and must receive the
result immediately.

### Internal asynchronous

Use **Kafka Pub/Sub** when the sender does not need an immediate
response.

``` text
Service A
    │ publish event
    ▼
Kafka
    ├──► Service B
    ├──► Service C
    └──► Service D
```

Examples of events: - `booking.created` - `booking.confirmed` -
`driver.assigned` - `trip.started` - `trip.completed` -
`payment.completed`

Important rule:

> Kafka is for events/asynchronous communication, not a replacement for
> synchronous RPC.

So the communication convention is:

  Communication                                     Technology
  ------------------------------------------------- ---------------
  Client → API Gateway                              REST/HTTPS
  API Gateway → Service                             gRPC
  Service → Service, immediate response needed      gRPC
  Service → Service, no immediate response needed   Kafka Pub/Sub

## 4. Driver realtime state

We discussed where to store driver status.

Decision:

-   Driver Service owns driver-related business data.
-   Redis stores realtime dispatch state.
-   Booking uses Redis to efficiently find nearby available drivers.
-   Driver location is also stored in Redis.
-   Redis is not a replacement for the Driver database.

Example realtime state:

``` text
driver:{driverId}
├── status
├── lat
├── lng
└── updatedAt
```

Typical statuses:

``` text
READY
BUSY
OFFLINE
```

Redis is especially useful because the system needs: - frequent status
updates - frequent location updates - nearby-driver lookup - geospatial
queries - fast reads

For nearby-driver lookup, Redis GEO functionality can be used.

Important ownership principle:

> Booking should not become the owner of Driver data merely because
> Booking needs to query driver availability.

## 5. Docker / deployment conventions

Each service should be independently buildable/deployable.

Each service can have its own:

``` text
Dockerfile
package.json
.env.example
```

Root `infrastructure/` is for system-wide infrastructure/orchestration,
such as:

``` text
infrastructure/
└── docker-compose.yml
```

Production `.env` should not be committed.

Root `.gitignore` can ignore all Node dependencies recursively with:

``` gitignore
node_modules/
```

Similarly:

``` gitignore
dist/
```

ignores build output recursively.

Recommended root environment rules:

``` gitignore
.env
.env.*
!.env.example
```

## 6. Auth Service --- current work

We decided to start implementation with the Auth Service.

Purpose:

> Auth answers "Who are you?" and "What role do you have?"

Current roles:

``` text
customer
driver
admin
```

Auth does NOT own realtime driver availability.

Driver availability remains Driver/Redis territory.

### Auth Service intended responsibilities

-   Register
-   Login
-   Refresh token
-   Logout
-   Identity
-   Access/role information
-   Password hashing
-   JWT authentication

Planned API:

``` text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

## 7. Auth Service technology

Current decision:

-   ExpressJS
-   TypeScript
-   PostgreSQL
-   Prisma ORM
-   bcrypt for password hashing
-   JWT for authentication
-   gRPC will be added later for internal service communication

Prisma is an ORM/database toolkit, not the database itself:

``` text
Auth Service
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
```

## 8. Auth Service current filesystem

The service currently has:

``` text
services/auth-service/
├── src/
├── .env
├── package.json
└── node_modules/
```

We intentionally use `src/` because the service will grow and eventually
contain domain/application/infrastructure/presentation layers.

`src/` is a convention, not an Express requirement.

Planned structure:

``` text
auth-service/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── domain/
│   │   └── entities/
│   ├── application/
│   │   └── services/
│   ├── infrastructure/
│   │   └── database/
│   ├── presentation/
│   │   └── http/
│   │       ├── controllers/
│   │       └── routes/
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

Do not create all of these folders prematurely. Build incrementally.

## 9. Express learning approach

The user is treating themselves as essentially a beginner with Express.

Do not dump a complete production architecture/codebase immediately.

Teach Express step by step:

``` text
Express
  ↓
HTTP Request / Response
  ↓
Routing
  ↓
Middleware
  ↓
JSON body
  ↓
dotenv/config
  ↓
Prisma + PostgreSQL
  ↓
bcrypt
  ↓
JWT
  ↓
Auth APIs
  ↓
gRPC
```

Current goal is to understand how a request flows through Express before
adding authentication/database complexity.

Basic server created/planned:

``` ts
import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Auth Service is running!");
});

app.listen(3001, () => {
    console.log("Auth Service running on port 3001");
});
```

The user has already encountered and resolved the ESM/CommonJS
configuration issue.

## 10. TypeScript / Node module system

We chose **ESM** for this project.

ESM uses:

``` ts
import express from "express";
export ...
```

CommonJS uses:

``` js
const express = require("express");
module.exports = ...
```

The Auth Service package should use:

``` json
{
  "type": "module"
}
```

Recommended TypeScript setup:

``` json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Development uses `tsx`:

``` json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

Conceptual flow:

``` text
TypeScript
   ↓
tsx during development
   ↓
Node.js
```

For production:

``` text
src/*.ts
   ↓
tsc
   ↓
dist/*.js
   ↓
node dist/server.js
```

## 11. Packages already discussed

Development tooling:

``` bash
npm install -D typescript tsx @types/node @types/express
```

Runtime dependency:

``` bash
npm install express
```

Not yet necessary to install all auth dependencies immediately. Add
dependencies incrementally when their purpose is understood.

Planned later:

``` bash
npm install dotenv bcrypt jsonwebtoken
npm install @prisma/client
npm install -D prisma @types/bcrypt @types/jsonwebtoken
```

Then initialize Prisma:

``` bash
npx prisma init
```

## 12. Important teaching preference

The user wants to understand what the framework is doing instead of
blindly using a generated framework template.

Explain concepts first, then implement them.

Avoid over-engineering early.

Use a vertical-slice progression and keep the current structure intact
when adding features.

## 13. Immediate next step

The next implementation step is to continue learning Express from the
minimal server:

1.  Understand `req` and `res`
2.  Understand HTTP methods and routing
3.  Learn `express.json()` and request body
4.  Learn middleware
5.  Introduce `.env` / `dotenv`
6.  Then introduce Prisma/PostgreSQL
7.  Build Register
8.  Build Login
9.  Add JWT refresh/logout
10. Add gRPC interface for API Gateway

At the current point, do NOT jump straight to Prisma/JWT/gRPC before the
Express basics are understood.
