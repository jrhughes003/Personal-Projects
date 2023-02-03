<?php

//regiters a user with an application
require('connblog.php');

if (isset($_POST['submitButton'])) {
    $username = $_POST['username'];
    $firstname = $_POST['firstName'];
    $lastname = $_POST['lastName'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $gucci = 0;

    if (!empty($firstname) && !empty($lastname) && !empty($email) && !empty($password) && !empty($username)) {
        $checkquery = "SELECT * FROM `users`;";
        $check = mysqli_query($conn, $checkquery);
        while ($row = mysqli_fetch_array($check)) {
            if ($username == $row['username'] or $email == $row['email']) {
                $gucci = 1;
                $msg = "Username or email is already registered";
            }
        }
        if ($gucci == 0) {
            $query = "INSERT INTO `users` (`userid`,`username`, `firstname`, `lastname`, `email`, `password`, `permission`) VALUES (NULL,'$username', '$firstname', '$lastname', '$email', '$hashed', '3');";
            echo $query;
            mysqli_query($conn, $query) or die("bad insert query duude");
            $msg = "you have registered well mydude";
        }

        $selectusers = "SELECT * FROM `users`";
        $result =  mysqli_query($conn, $selectusers) or die('Bad select query');
    } else {
        $msg = 'please fill in all fields';
    }
}
?>
<html>

<body>
    <h1> register here</h1>

    <?php if (isset($msg)) {
        echo '<span style=red>' . $msg . '</span>';
    }
    ?>
    <form method='POST' action='<?php echo $_SERVER['PHP_SELF']; ?>'>
        Username <input type="text" name="username"><br>
        First name: <input type='text' name='firstName'><br>
        Last name:<input type='text' name='lastName'><br>
        Email:<input type='email' name='email'><br>
        Password: <input type='password' name='password'><br>
        <input type='submit' name='submitButton' value='REGISTER'>



    </form>

    </table>


</body>

</html>

<!-- <?php if ($showUserstable == 1) { ?>
    <table width='50%' border='1'>
        <thead>
        </thead>
    <?php

            while ($row = mysqli_fetch_array($result)) {
                echo '<tr><td>' . $row['firstname'] . '</td><td>' . $row['lastname'] . '</td><td>' . $row['email'] . '</td></tr>';
            }
        }
    ?> -->