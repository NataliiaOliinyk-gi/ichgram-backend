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

  - GET `/users/:id` – отримання профілю по ID
  - PUT `/users/me` – оновлення імені, біо, фото
