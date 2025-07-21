**authRouter**

- все, що стосується авторизації і конфіденційної інформації:

  `/api/auth`

  - POST `/register`

    - email
    - fullName
    - username
    - password

  - POST `/login`

    - email
    - password

  - POST `/refresh-token`

  - GET `/current`

  - PUT `/change-password`

    - password
    - newPassword

  - PUT `/change-email`

    - newEmail
    - password

  - POST `/logout`

  - DELETE `/delete-account`
    - password

**usersRouter**

- публічні/загальні дії з профілем:

  `/api/users`

  - GET `/:id` – отримання профілю по ID
  - PUT `/me` – оновлення імені, біо, фото

    - fullName
    - username
    - biography
    - profilePhoto

<!-- GET /api/users — список всіх користувачів (публічний список, можливо з пошуком)
GET /api/users/:id/followers — підписники
GET /api/users/:id/following — підписки
POST /api/users/:id/follow — підписатись
DELETE /api/users/:id/follow — відписатись -->
