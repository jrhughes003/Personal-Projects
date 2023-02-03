<?php


session_start();
//check if submit clicked
if (isset($_POST['submitButton'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $msg = '';
    if (empty($email) or empty($password)) {
        $msg = "please fill in all fields";
    } else {
        require('connblog.php');
        $query = "SELECT * FROM `users` WHERE `users`.`email` = '$email'";
        echo $query;
        $result = mysqli_query($conn, $query) or die('bad query');

        if ($rowcount = mysqli_num_rows($result) > 0) {
            //check if password matches
            while ($row = mysqli_fetch_array($result)) {
                if ($password == $row['password']) {
                    $_SESSION['firstname'] = $row['firstname'];
                    $_SESSION['userid'] = $row['userid'];
                    $_SESSION['permissionsid'] = $row['permissionsid'];

                    //forward user to restricted area
                    header('Location: loggedin.php');
                    $msg = "Success";
                } else {
                    $msg = "User name or password are invalid";
                }
            }
        } else {
            $msg = "User name or password are invalid";
        }
    }
} else {
    $msg = '';
}

?>

<body>
    <?php include('blog.php'); ?>
    <h1>Login</h1>
    <p style="color:red;"><b> <?php echo $msg; ?> </b></p>
    <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
        <table>
            <tr>
                <td>
                    Email:
                </td>
                <td> <input type="email" name="email"></td>
            </tr>
            <tr>
                <td>
                    Passsword:
                </td>
                <td> <input type="password" name="password"></td>
            </tr>
            <tr>
                <td> <input type="submit" name="submitButton" value="Login"></td>
            </tr>
        </table>
    </form>
</body>
<html>

</html>