<?php
require('connblog.php');
session_start();
$userid = $_SESSION['userid'];
echo "logged in fool";

if (isset($_POST['submitButton'])) {
    $category = $_POST['category'];
    $post = $_POST['post'];
    $query = "INSERT INTO `posts` (`postid`, `user`, `category`, `post`, `datepublished`) VALUES (NULL, '$userid', '$category', '$post', current_timestamp());";
    echo $query;
    mysqli_query($conn, $query) or die('bad query');
}
?>

<html>

<body>
    <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
        Post: <input style="height:400px; width:600px;" type='text' name='post'>
        Catergory: <select name="category" id="category">
            <option value="1">Sports</option>
            <option value="2">History</option>
            <option value="3">News</option>
            <option value="4">Other</option>
        </select>
        <input type="submit" name="submitButton">
    </form>
</body>

</html>