# Blog Platform

A multi-user blog built in high school: registration, login with sessions, posting with category tags (Sports, History, News, Other), and user profile editing.

**Tech:** PHP, MySQL, Bootstrap

## Running locally

1. Install a PHP + MySQL stack (e.g. XAMPP).
2. Create a MySQL database named `blog` with `users` and `posts` tables.
3. Adjust the credentials in `connblog.php` if needed.
4. Serve this folder and open `blog.php`.

## Files

| File | Purpose |
| --- | --- |
| `blog.php` | Landing page |
| `registerblog.php` | Account sign-up (passwords hashed with `password_hash()`) |
| `bloglogin.php`, `login.php` | Login |
| `loggedin.php` | Create and view posts |
| `users.php`, `userEdit.php` | User list and profile editing |
| `logout.php` | End the session |
| `nav.php`, `bootblog.php` | Shared navigation and Bootstrap includes |
| `connblog.php`, `conn.php` | Database connections |

> **Note:** This was a learning project. Queries are built by string concatenation rather than prepared statements, so it isn't safe to expose publicly as-is.
