<?php
session_start();
//check for login
if (!isset($_SESSION['userid'])) {
    header('Location: login.php');
} else {
    //list all users
    require('conn.php');
    $query = "SELECT * FROM `users`";
    $result = mysqli_query($conn, $query) or die('bad query');

?>

    <html>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js" integrity="sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf" crossorigin="anonymous"></script>

    <body>
        <form name="displayUsers" method="POST" action="<?php echo 'userEdit.php'; ?>">

            <table border='1' width='50%' cellpadding='10'>
                <thead>
                    <tr>
                        <td> User ID </td>
                        <td> First Name </td>
                        <td> Last Name </td>
                        <td> Email </td>
                        <td> Permission </td>
                    </tr>
                </thead>
                <tbody>
                    <form name="displayUsers" method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                        <?php
                        while ($row = mysqli_fetch_array($result)) {
                            echo "<tr><td><input type = 'radio' name = 'userid' value = '" . $row['userid'] . "'></td>";

                            echo "<td>" . $row['firstname'] . "</td>";
                            echo "<td>" . $row['lastname'] . "</td>";
                            echo "<td>" . $row['email'] . "</td>";
                            echo "<td>" . $row['permissions'] . "</td></tr>";
                        }
                        ?>
                </tbody>
            </table>
            <input type='submit' name='submitButton' value='Edit Selected User'>
        </form>


    </body>

    </html>
<?php } ?>