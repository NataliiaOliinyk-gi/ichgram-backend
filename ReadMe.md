**authRouter** `/api/auth`
- все, що стосується авторизації і конфіденційної інформації:

  - POST `/api/auth/register` реєстрація
  - POST `/api/auth/login` логін
  - POST `/api/auth/verify` верифікація пошти
  - POST `/api/auth/resend-verify-email` повторний запит на надсилання листа для підтвердження пошти
  - POST `/api/auth/forgot-password` запит на скидування пароля

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

`me/create-post`

<!-- GET /api/users — список всіх користувачів (публічний список, можливо з пошуком)
GET /api/users/:id/followers — підписники
GET /api/users/:id/following — підписки
POST /api/users/:id/follow — підписатись
DELETE /api/users/:id/follow — відписатись -->

Інші роути:

`/search`
`/explore`
`/messages`
`/notifications`

---

User / Profile

GET /api/me — мій профіль
PUT /api/me — оновити свій профіль
GET /api/me/posts — мої пости
DELETE /api/me — видалити акаунт (опційно)

GET /api/users/:id — чужий профіль
GET /api/users/:id/posts — пости цього користувача
GET /api/users — список користувачів (наприклад, для пошуку)

Posts

POST /api/posts — створити пост (автор = req.user.id)
GET /api/posts — всі пости (feed: від підписок)
GET /api/posts/explore — explore feed: рандом/випадкові
GET /api/posts/:id — деталі поста
PUT /api/posts/:id — оновити свій пост (якщо власник)
DELETE /api/posts/:id — видалити свій пост (якщо власник)

Likes
POST /api/posts/:id/like — лайкнути пост
DELETE /api/posts/:id/like — прибрати лайк
GET /api/posts/:id/likes — всі лайки поста (опціонально)

Comments

POST /api/posts/:id/comments — додати коментар
GET /api/posts/:id/comments — отримати всі коментарі
DELETE /api/comments/:commentId — видалити свій коментар
PUT /api/comments/:commentId — редагувати свій коментар (опціонально)

Notifications

GET /api/notifications — всі сповіщення користувача
PUT /api/notifications/:id — позначити як прочитане

Follow / Unfollow


POST   /api/follow/:targetId     // підписатися
DELETE /api/follow/:targetId     // відписатися
GET    /api/users/:id/followers  // список фоловерів (пагінація)
GET    /api/users/:id/following  // список підписок (пагінація)

Messaging (приватні повідомлення) (опційно)

GET /api/conversations — мої чати
GET /api/conversations/:id — конкретна розмова
POST /api/conversations — створити нову розмову
POST /api/messages — надіслати повідомлення

Зберігання файлів (зображення постів/аватарки)
POST /api/upload/avatar
POST /api/upload/post-image
