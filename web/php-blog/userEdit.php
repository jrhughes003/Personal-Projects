<?php
require('conn.php');
require('strap.php');

$userid = $_POST['userid'];
$query = "SELECT * FROM `users` WHERE `users`.`userid` =" . $userid;
$result = mysqli_query($conn, $query) or die('bad query');


if (isset($_POST['Button'])) {
    $firstname = $_POST['firstname'];
    $permissions = $_POST['permissions'];
    $lastname = $_POST['lastname'];
    $email = $_POST['email'];
    $id = $_POST['userid'];
    if (!isset($_POST['password'])) {
        $update = "UPDATE `users` SET `firstname` = '$firstname', `lastname` = '$lastname', `email` = '$email', `permissions` = '$permissions' WHERE `users`.`userid` = $id;";
    } else {
        $password = $_POST['password'];
        $update = "UPDATE `users` SET `firstname` = '$firstname', `lastname` = '$lastname', `email` = '$email', `password` = '$password', `permissions` = '$permissions' WHERE `users`.`userid` = $id;";
    }

    mysqli_query($conn, $update) or die('bad update dude');
    $msg = "succesful update";
}
?>

<html>

<head>
</head>

<body>
    <h1>edit user</h1>
    <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">

        <?php while ($row = mysqli_fetch_array($result)) {
        ?>
            <input type="hidden" name="userid" value="<?php echo $userid; ?>">
            First Name:<input type='text' name='firstname' value='<?php echo $row['firstname']; ?>'><br>
            Last Name:<input type='text' name='lastname' value='<?php echo $row['lastname']; ?>'><br>
            Email:<input type='text' name='email' value='<?php echo $row['email']; ?>'><br>
            Password:<input type='text' name='password'><br>
            Permissions:<input type='number' name='permissions' value='<?php echo $row['permissions']; ?>'><br>

        <?php }
        if (isset($msg)) {
            echo $msg;
        } ?>
        <input type="submit" name="Button" value="Edit">
    </form>
</body>

</html>