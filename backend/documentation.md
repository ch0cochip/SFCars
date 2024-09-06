# 3900w11bsegmentationfault Backend Documentation

## API

### Auth

<details>
  <summary><code>POST</code> <code><b>/auth/register</b></code> <code>(registers a new user)</code></summary>

##### Parameters

> | name             | type | data type | description   |
> | ---------------- | ---- | --------- | ------------- |
> | Register Details | body | Object    | New User data |
>
> Register Details:
>
> ```
> {
>     "email": "example@email.com",
>     "password": "example_password"
>     "first_name": "example_first"
>     "last_name": "example_last"
>     "phone_number": "0412345678"
> }
> ```

##### Responses

> | http code | response                      |
> | --------- | ----------------------------- |
> | `200`     | `{ "token": str(ObjectId) }`  |
> | `400`     | `{ "error": "_ is required"}` |

</details>

<details>
  <summary><code>POST</code> <code><b>/auth/login</b></code> <code>(logs in an existing user)</code></summary>

##### Parameters

> | name          | type | data type | description     |
> | ------------- | ---- | --------- | --------------- |
> | Login Details | body | Object    | Login User data |
>
> Login Details:
>
> ```
> {
>     "email": "example@email.com",
>     "password": "example_password"
> }
> ```

##### Responses

> | http code | response                                  |
> | --------- | ----------------------------------------- |
> | `200`     | `{ "token": str(ObjectId) }`              |
> | `400`     | `{ "error": "Invalid email or password"}` |

</details>

<details>
  <summary><code>POST</code> <code><b>/auth/register/admin</b></code> <code>(registers a new admin)</code></summary>

##### Parameters

> | name             | type | data type | description   |
> | ---------------- | ---- | --------- | ------------- |
> | Register Details | body | Object    | New User data |
>
> Register Details:
>
> ```
> {
>     "email": "example@email.com",
>     "password": "example_password"
>     "first_name": "example_first"
>     "last_name": "example_last"
>     "phone_number": "0412345678"
> }
> ```

##### Responses

> | http code | response                      |
> | --------- | ----------------------------- |
> | `200`     | `{ "token": str(ObjectId) }`  |
> | `400`     | `{ "error": "_ is required"}` |

</details>

### User

<details>
  <summary><code>GET</code> <code><b>/user/{user_id}</b></code> <code>(gets information on the given user)</code></summary>

##### Parameters

> | name      | type | data type | description   |
> | --------- | ---- | --------- | ------------- |
> | `user_id` | path | string    | User ObjectId |

##### Responses

> | http code | response                        |
> | --------- | ------------------------------- |
> | `200`     | User Data Object                |
> | `400`     | `{ "error": "Invalid user id"}` |
>
> User Data Object:
>
> ```
> {
>     "_id": "6496e8e2876de3535cf3aa02",
>     "bookings": [],
>     "email": "example@gmail.com",
>     "first_name": "example_first",
>     "last_name": "example_last",
>     "listings": [],
>     "phone_number": "0412345678",
>     "vehicle_details": [],
>     "payment_details": [],
>     "reviews": [],
>     "revenue": 0,
>     "is_admin": False,
>     "rating": 5.0,
> }
> ```

</details>

<details>
  <summary><code>GET</code> <code><b>/user/profile</b></code> <code>(gets information on the current user)</code></summary>

##### Parameters

> | name            | type   | data type | description      |
> | --------------- | ------ | --------- | ---------------- |
> | `Authorization` | header | string    | "Bearer {token}" |

##### Responses

> | http code | response         |
> | --------- | ---------------- |
> | `200`     | User Data Object |
> | `401`     | `Unauthorized`   |
>
> User Data Object:
>
> ```
> {
>     "_id": "6496e8e2876de3535cf3aa02",
>     "bookings": [],
>     "email": "example@gmail.com",
>     "first_name": "example_first",
>     "last_name": "example_last",
>     "payment_details": [
>         {
>             "card_number": "1234 5678 9012 3456",
>             "expiry_date": "09/23",
>             "cvv": "123",
>         }
>     ],
>     "vehicle_details": [
>         {
>             "registration_number": "ABC123",
>             "vehicle_type": "Sedan",
>             "vehicle_make": "Honda",
>             "vehicle_model": "Civic",
>         }
>     ],
>     "listings": [],
>     "phone_number": [
>         "0412345678"
>     ],
>     "reviews": [],
>     "revenue": 0,
>     "rating": 5.0,
> }
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/user/profile</b></code> <code>(updates information on the current user)</code></summary>

##### Parameters

> | name            | type   | data type | description               |
> | --------------- | ------ | --------- | ------------------------- |
> | `Authorization` | header | string    | "Bearer {token}"          |
> | Update Info     | body   | object    | Information to be updated |
>
> Update Info Example:
>
> ```
> {
>     "first_name": "new_first_name",
>     "last_name": "new_last_name"
> }
> ```
>
> _Note: for array typed fields, you must send the whole array to update_

##### Responses

> | http code | response                                       |
> | --------- | ---------------------------------------------- |
> | `200`     | `{}`                                           |
> | `401`     | `Unauthorized`                                 |
> | `400`     | `{ "error": "Cannot update <key>" }`           |
> | `400`     | `{ "error": "Invalid update key" }`            |
> | `400`     | `{ "error": "Update value has invalid type" }` |

</details>

<details>
  <summary><code>DELETE</code> <code><b>/user/profile</b></code> <code>(deletes the current user)</code></summary>

##### Parameters

> | name            | type   | data type | description      |
> | --------------- | ------ | --------- | ---------------- |
> | `Authorization` | header | string    | "Bearer {token}" |

##### Responses

> | http code | response       |
> | --------- | -------------- |
> | `200`     | `{}`           |
> | `401`     | `Unauthorized` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/analytics</b></code> <code>(returns user analytics)</code></summary>

##### Parameters

> | name            | type   | data type | description      |
> | --------------- | ------ | --------- | ---------------- |
> | `Authorization` | header | string    | "Bearer {token}" |

##### Responses

> | http code | response         |
> | --------- | ---------------- |
> | `200`     | `Analytics Body` |
> | `401`     | `Unauthorized`   |
>
> Update Info Example:
>
> ```
> {
>     "monthly_revenue": [{
>         "month": 1,
>         "revenue": 100.0
>     }],
>     "bookings_per_listing": [{
>         "listing_id": ObjectId(),
>         "bookings": 2
>     }],
>     "total_bookings": 3
> }
> ```

</details>

### Listings

<details>
  <summary><code>GET</code> <code><b>/listings</b></code> <code>(gets all listings)</code></summary>

##### Parameters

> | name   | type | data type | description |
> | ------ | ---- | --------- | ----------- |
> | `None` |      |           |             |

##### Responses

> | http code | response                         |
> | --------- | -------------------------------- |
> | `200`     | `{ "listings": Listings Array }` |
>
> Listing Details:
>
> ```
> {
>    listing_id: ....
>    address: {
>        "formatted_address": "Sydney NSW, Australia",
>        "street_number": "",
>        "street": "",
>        "city": "",
>        "state": "NSW",
>        "postcode": "",
>        "country": "Australia",
>        "lat": -33.8688197,
>        "lng": 151.2092955,
>        "place_id": "ChIJP3Sa8ziYEmsRUKgyFmh9AQM"
>    },
>    type: 'Carport / Driveway / Garage / Parking Lot',
>    max_vehicle_size: 'Bike / Hatchback / Sedan / 4WD/SUV / Van / Truck',
>    access_type: 'None / Boom Gate / Key / Passcode / Permit / Remote / Ticket / Swipe Card',
>    ev_charging: true / false,
>    description: 'This is a description',
>    instructions: 'This is the instructions',
>    casual_booking: true / false,
>    monthly_booking: true / false,
>    pricing: {
>        "hourly_rate": 100,
>        "monthly_rate": 1000,
>    }
>    photos: [image1, image2, image3]
>    "availability": {
>        "is_24_7": true / false,
>        "start_time": "08:00",
>        "end_time": "17:00",
>        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
>    }
>    "safety_features": ["CCTV", "On-site security", "Well lit"],
>    "amenities": ["Restrooms", "Nearby shopping", "Charging station"],
>    "rating": 0.5,
>    "reviews": [
>        {
>            "_id": ...,
>            "user_id": ...,
>            "booking_id": ...,
>            "listing_id": ...,
>            "name": John,
>            "rating": 2.5,
>            "message": "this is my review",
>            "timestamp": "2023-07-26T23:09:38.550716",
>        }
>    ]
> }
> ```

</details>

<details>
  <summary><code>POST</code> <code><b>/listings/new</b></code> <code>(adds a new listing)</code></summary>

##### Parameters

> | name             | type   | data type | description      |
> | ---------------- | ------ | --------- | ---------------- |
> | `Authorization`  | header | string    | "Bearer {token}" |
> | New Listing Info | body   | object    | Listing Object   |
>
> Update Info Example:
>
> ```
> {
>     "address": {
>         "formatted_address": "1 George St, Parramatta NSW 2150, Australia",
>         "street_number": "1",
>         "street": "George Street",
>         "city": "Parramatta",
>         "state": "NSW",
>         "postcode": "2150",
>         "country": "Australia",
>         "lat": -33.8133727,
>         "lng": 151.0005189,
>         "place_id": "ChIJveAk1h-jEmsRUuA6kM2-8_c",
>     },
>     "price": 100,
>     "space_type": "Driveway",
>     "max_size": "SUV",
>     "description": "Listing Description",
>     "access_type": "Key Card",
>     "images": [
>         "Base64 Encoded Image"
>     ],
>     "features": [
>         "Electric Vehicle Charging"
>     ],
> }
> ```

##### Responses

> | http code | response                                   |
> | --------- | ------------------------------------------ |
> | `200`     | `{}`                                       |
> | `401`     | `Unauthorized`                             |
> | `400`     | `{ "error": "Valid <field> is required" }` |

</details>

<details>
  <summary><code>GET</code> <code><b>/listings/{listing_id}</b></code> <code>(gets a specific listing)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `listing_id` | path | str(ObjectId) | Listing ObjectId |

##### Responses

> | http code | response                            |
> | --------- | ----------------------------------- |
> | `200`     | Listing Information Object          |
> | `401`     | `Unauthorized`                      |
> | `400`     | `{ "error": "Invalid listing id" }` |
>
> Listing Info Example:
>
> ```
> {
>     "_id": str(ObjectId())
>     "provider": str(ObjectId())
>     "address": {
>         "formatted_address": "1 George St, Parramatta NSW 2150, Australia",
>         "street_number": "1",
>         "street": "George Street",
>         "city": "Parramatta",
>         "state": "NSW",
>         "postcode": "2150",
>         "country": "Australia",
>         "lat": -33.8133727,
>         "lng": 151.0005189,
>         "place_id": "ChIJveAk1h-jEmsRUuA6kM2-8_c",
>     },
>     "hourly_price": 5,
>     "daily_price": 120,
>     "space_type": "Driveway",
>     "max_size": "SUV",
>     "description": "Listing Description",
>     "access_type": "Key Card",
>     "images": [
>         "Base64 Encoded Image"
>     ],
>     "features": [
>         "Electric Vehicle Charging"
>     ],
>    "rating": 0.5,
>    "reviews": [
>        {
>            "_id": ...,
>            "user_id": ...,
>            "booking_id": ...,
>            "listing_id": ...,
>            "name": John,
>            "rating": 2.5,
>            "message": "this is my review",
>            "timestamp": "2023-07-26T23:09:38.550716",
>        }
>    ]
> }
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/listings/{listing_id}</b></code> <code>(updates a specific listing)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `listing_id` | path | str(ObjectId) | Listing ObjectId |
> | Update Info  | body | Object        | Updating Object  |
>
> Update Info Example:
>
> ```
> {
>     "daily_price": 6,
>     "space_type": "Garage",
> }
> ```
>
> _Note: for array typed fields, you must send the whole array to update_

##### Responses

> | http code | response                            |
> | --------- | ----------------------------------- |
> | `200`     | `{}`                                |
> | `401`     | `Unauthorized`                      |
> | `400`     | `{ "error": "Invalid listing id" }` |

</details>

<details>
  <summary><code>DELETE</code> <code><b>/listings/{listing_id}</b></code> <code>(deletes a specific listing)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `listing_id` | path | str(ObjectId) | Listing ObjectId |

##### Responses

> | http code | response       |
> | --------- | -------------- |
> | `200`     | `{}`           |
> | `401`     | `Unauthorized` |

</details>

### Bookings

<details>
  <summary><code>POST</code> <code><b>/listings/book</b></code> <code>(creates new booking)</code></summary>

##### Parameters

> | name            | type | data type | description      |
> | --------------- | ---- | --------- | ---------------- |
> | Booking Details | body | Object    | New booking data |
>
> Booking Details:
>
> ```
> {
>     "consumer": ObjectId(6496e8e2876de3535cf3aa02)
>     "listing_id": ObjectId(6496e8e2876de3535cf3aa02)
>     "start_time": '2022-01-01T00:00:00'
>     "end_time": '2022-01-23T00:00:00'
>     "price": 100.0,
>     "recurring": '' or 'daily' or 'weekly' or 'biweekly' or 'monthly'
> }
> ```

##### Responses

> | http code | response                          |
> | --------- | --------------------------------- |
> | `200`     | `{ "token": str(ObjectId) }`      |
> | `400`     | `{ "error": "_ is required"}`     |
> | `400`     | `{ "error": "Invalid time slot"}` |

</details>

<details>
  <summary><code>GET</code> <code><b>/bookings/{booking_id}</b></code> <code>(gets a specific booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |

##### Responses

> | http code | response                            |
> | --------- | ----------------------------------- |
> | `200`     | Booking Information Object          |
> | `401`     | `Unauthorized`                      |
> | `400`     | `{ "error": "Invalid booking id" }` |
>
> Booking Info Example:
>
> ```Python
> {
>     "_id": str(ObjectId())
>     "consumer": str(ObjectId())
>     "listing_id": str(ObjectId())
>     "start_time": '2022-01-01T00:00:00'
>     "end_time": '2022-01-23T00:00:00'
>     "price": 100.0
>     "parent": str(ObjectId())
>     "child": str(ObjectId())
>     "exclusions": [ObjectId(), ObjectId()]
> }
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/bookings/{booking_id}</b></code> <code>(updates a specific booking</code></summary>

##### PARAMETERS

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |
> | Update Info  | body | Object        | Updating Object  |
>
> Update Info Example:
>
> ```Python
> {
>     "price": 200.0
>     "start_time": '2022-01-01T00:00:00'
>     "end_time": '2022-01-03T02:00:00'
> }
> ```

##### Responses

> | http code | response                       |
> | --------- | ------------------------------ |
> | `200`     | `{ 'booking_id': ObjectId() }` |
> | `401`     | `Unauthorized`                 |
> | `400`     | `{ "error": "Invalid _" }`     |

</details>

<details>
  <summary><code>DELETE</code> <code><b>/bookings/{booking_id}</b></code> <code>(deletes/cancels a specific booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |
> | `data`       | json | string        | see example      |
>
> Data Info Example:
>
> ```Python
> {
>       "start_time": '2022-01-01T10:00:00',
>       "end_time": '2022-01-01T11:00:00,
>       "type": 'single' or 'future'
> }
> ```
>
> Type - user wants to either delete a single or future instance

##### Responses

> | http code | response       |
> | --------- | -------------- |
> | `200`     | `{}`           |
> | `401`     | `Unauthorized` |

</details>

<details>
  <summary><code>GET</code> <code><b>/profile/completed-bookings</b></code> <code>(gets user's completed bookings)</code></summary>

##### Parameters

> | name            | type   | data type | description      |
> | --------------- | ------ | --------- | ---------------- |
> | `Authorization` | header | string    | "Bearer {token}" |

##### Responses

> | http code | response                    |
> | --------- | --------------------------- |
> | `200`     | `{}` or `[{booking_infos}]` |

</details>

<details>
  <summary><code>GET</code> <code><b>/bookings/{booking_id}/review</b></code> <code>(get a review for a booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |

##### Responses

> | http code | response                               |
> | --------- | -------------------------------------- |
> | `200`     | Booking Information Object             |
> | `401`     | `Unauthorized`                         |
> | `400`     | `{ "error": "Invalid booking id" }`    |
> | `400`     | `{ "error": "Booking doesn't exist" }` |
> | `400`     | `{ "error": "Review does not exist" }` |
>
> Booking Info Example:
>
> ```Python
> {
>     "_id": ObjectId(),
>     "user_id": ObjectId(),
>     "booking_id": ObjectId(),
>     "listing_id": ObjectId(),
>     "name": John,
>     "rating": 2.5,
>     "message": "this is my review",
>     "timestamp": "2023-07-26T23:09:38.550716",
> }
> ```

</details>

<details>
  <summary><code>PUT</code> <code><b>/bookings/{booking_id}/review</b></code> <code>(update a review for a booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |
> | Update Info  | body | Object        | Updating Object  |
>
> Update Info Example:
>
> ```
> {
>     "rating": 5,
>     "message": "Updated this is great",
> }
> ```

##### Responses

> | http code | response                                         |
> | --------- | ------------------------------------------------ |
> | `200`     | Booking Id                                       |
> | `401`     | `Unauthorized`                                   |
> | `400`     | `{ "error": "Invalid booking id" }`              |
> | `400`     | `{ "error": "Booking doesn't exist" }`           |
> | `400`     | `{ "error": "Review does not exists" }`          |
> | `400`     | `{ "error": "Cannot update key" }`               |
> | `400`     | `{ "error": "Update value has invalid typing" }` |

</details>

<details>
  <summary><code>POST</code> <code><b>/bookings/{booking_id}/review</b></code> <code>(add a review for a booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |
> | Review Info  | body | Object        | Review Body      |
>
> Review Info Example:
>
> ```
> {
>     "rating": 5,
>     "message": "Updated this is great",
> }
> ```

##### Responses

> | http code | response                                   |
> | --------- | ------------------------------------------ |
> | `200`     | Booking Id                                 |
> | `401`     | `Unauthorized`                             |
> | `400`     | `{ "error": "Invalid booking id" }`        |
> | `400`     | `{ "error": "Booking doesn't exist" }`     |
> | `400`     | `{ "error": "Review already exists" }`     |
> | `400`     | `{ "error": "Valid rating is required" }`  |
> | `400`     | `{ "error": "Valid message is required" }` |

</details>

<details>
  <summary><code>DELETE</code> <code><b>/bookings/{booking_id}/review</b></code> <code>(delete a review on a booking)</code></summary>

##### Parameters

> | name         | type | data type     | description      |
> | ------------ | ---- | ------------- | ---------------- |
> | `booking_id` | path | str(ObjectId) | Booking ObjectId |
> | Empty Body   | body | Object        | Body             |
>
> _An empty body may be required if `415 Unsupported Media Type` error occurs_

##### Responses

> | http code | response                                |
> | --------- | --------------------------------------- |
> | `200`     | Booking Id                              |
> | `401`     | `Unauthorized`                          |
> | `400`     | `{ "error": "Invalid booking id" }`     |
> | `400`     | `{ "error": "Booking doesn't exist" }`  |
> | `400`     | `{ "error": "Review does not exists" }` |

</details>

### Payments

<details>
  <summary><code>POST</code> <code><b>/pay</b></code> <code>(customer can pay booking)</code></summary>

##### Parameters

> | name         | type | data type | description         |
> | ------------ | ---- | --------- | ------------------- |
> | `bill_id`    | path | ObjectId  | bill id             |
> | `use_wallet` | body | bool      | pay through wallet? |

##### Responses

> | http code | response                                             |
> | --------- | ---------------------------------------------------- |
> | `200`     | { amount_received: x } for listing provider          |
> | `401`     | `Unauthorized`                                       |
> | `400`     | `{ "error": "Valid bill id is required" }            |
> | `400`     | `{ "error": "Valid payment option is required" }`    |
> | `400`     | `{ "error": "Incorrect user is paying" }`            |
> | `400`     | `{ "error": "Wallet does not have enough balance" }` |

</details>

<details>
  <summary><code>POST</code> <code><b>/top-up</b></code> <code>(customer can topup their wallet)</code></summary>

##### Parameters

> | name      | type   | data type | description     |
> | --------- | ------ | --------- | --------------- |
> | `user_id` | header | ObjectId  | user id         |
> | `amt`     | body   | float     | amount to topup |

##### Responses

> | http code | response                                             |
> | --------- | ---------------------------------------------------- |
> | `200`     |                                                      |
> | `400`     | `{ "error": "Valid user id is required" }            |
> | `400`     | `{ "error": "Valid amount is required" }`            |
> | `400`     | `{ "error": "Wallet does not have enough balance" }` |

</details>

<details>
  <summary><code>POST</code> <code><b>/withdraw</b></code> <code>(customer can withdraw money from their wallet)</code></summary>

##### Parameters

> | name      | type   | data type | description        |
> | --------- | ------ | --------- | ------------------ |
> | `user_id` | header | ObjectId  | user id            |
> | `amt`     | body   | float     | amount to withdraw |

##### Responses

> | http code | response                                             |
> | --------- | ---------------------------------------------------- |
> | `200`     |                                                      |
> | `400`     | `{ "error": "Valid user id is required" }            |
> | `400`     | `{ "error": "Valid amount is required" }`            |
> | `400`     | `{ "error": "Wallet does not have enough balance" }` |

</details>

<details>
  <summary><code>POST</code> <code><b>/bill</b></code> <code>(bill a customer for a booking)</code></summary>

##### Parameters

> | name         | type | data type | description |
> | ------------ | ---- | --------- | ----------- |
> | `booking_id` | body | ObjectId  | booking id  |

##### Responses

> | http code | response                                      |
> | --------- | --------------------------------------------- |
> | `200`     |                                               |
> | `400`     | `{ "error": "User does not exist in system" } |
> | `400`     | `{ "error": "Valid booking is required" }`    |

</details>

## Database

### UserAccount

| Field                | Type     | Example                              |
| -------------------- | -------- | ------------------------------------ |
| `_id`                | ObjectId | ObjectId(6496e8e2876de3535cf3aa02)   |
| `email`              | string   | "user@email.com"                     |
| `password`           | string   | _hashed password string_             |
| `first_name`         | string   | "first"                              |
| `last_name`          | string   | "last"                               |
| `phone_number`       | string   | "0412345678"                         |
| `vehicle_details`    | Array    | [Vehicle Details Object]             |
| `payment_details`    | Array    | [Payment Details Object]             |
| `bookings`           | Array    | [ObjectId(6496e8e2876de3535cf3aa02)] |
| `listings`           | Array    | [ObjectId(6496e8e2876de3535cf3aa02)] |
| `revenue`            | float    | 200.0                                |
| `is_admin`           | bool     | False                                |
| `rating`             | float    | 5.0                                  |
| `inbox`              | Array    | [Message Object]                     |
| `pfp`                | Array    | Base64 String                        |
| `wallet`             | Array    | 0                                    |
| `recent_transactions`| Array    | [Transaction Object]                 |

### Listings

| Field          | Type     | Example                            |
| -------------- | -------- | ---------------------------------- |
| `_id`          | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `provider`     | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `address`      | Object   | Address Object                     |
| `hourly_price` | float    | 5.0                                |
| `daily_price`  | float    | 100.0                              |
| `space_type`   | string   | "Driveway"                         |
| `max_size`     | string   | "SUV"                              |
| `description`  | string   | "Listing Description"              |
| `access_type`  | string   | "Key Card"                         |
| `images`       | Array    | ["Base64 encoded image"]           |
| `features`     | Array    | ["Electric Charging"]              |

### Bookings

| Field        | Type       | Example                            |
| ------------ | ---------- | ---------------------------------- |
| `_id`        | ObjectId   | ObjectId(6496e8e2876de3535cf3aa02) |
| `consumer`   | ObjectId   | ObjectId(6496e8e2876de3535cf3aa02) |
| `listing_id` | ObjectId   | ObjectId(6496e8e2876de3535cf3aa02) |
| `start_time` | str        | 2022-01-01T00:00:00                |
| `end_time`   | str        | 2022-01-05T00:00:00                |
| `price`      | float      | 100.0                              |
| `parent`     | ObjectId   | ObjectId(6496e8e2876de3535cf3aa02) |
| `child`      | ObjectId   | ObjectId(6496e8e2876de3535cf3aa02) |
| `exclusions` | [ObjectId] | [ObjectId(), ObjectId()]           |
| `paid`       | bool       | False                              |

### Reviews

| Field        | Type     | Example                            |
| ------------ | -------- | ---------------------------------- |
| `_id`        | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `user_id`    | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `booking_id` | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `listing_id` | ObjectId | ObjectId(6496e8e2876de3535cf3aa02) |
| `name`       | str      | John                               |
| `rating`     | float    | 2.5                                |
| `message`    | str      | great message                      |
| `timestamp`  | str      | 2023-07-26T23:09:38.550716         |
