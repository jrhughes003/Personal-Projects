<?php
//first clicked roll
session_start();
$array = array();
$_SESSION['rolledDice'] = array();
$_SESSION['diceKept'] = array();
$_SESSION['count'] = 0;
if (isset($_POST['submitButton'])) {
    //set neccessary variables

    $_SESSION['sum'] = 0;



    //roll dice
    for ($c = 1; $c <= $_SESSION['diceNeeded']; $c++) {
        array_push($_SESSION['rolledDice'], rand(1, 6));
    }
    //keep the die that was selected
    if (isset($_POST['dieSelected'])) {
        $value = $_POST['dieSelected'];
        array_push($_SESSION['diceKept'], $value);
    }
    $_SESSION['count']++;

    //keep track of sum
    for ($y = 0; $y < count($_SESSION['diceKept']); $y++) {
        $_SESSION['sum'] = $_SESSION['sum'] + $_SESSION['diceKept'][$y];
    }
    //take away turn
    $_SESSION['diceNeeded']--;

    //end of game validation
    if ($_SESSION['diceNeeded'] < 0) {
        if ($_SESSION['sum'] <= 9) {
            $msg = "You win";
        } else {
            $msg = "You Lose!!!";
        }
    } else {
        $msg = "<p><b><i> The goal is to keep your sum under 11! keep a die each time and good luck!</i></b></p>";
    }

    //see data, just for me!
    echo $_SESSION['count'];
    echo "<br>";
    print_r($_SESSION['diceKept']);
    echo "<br>";
    print_r($_SESSION['rolledDice']);
    echo "<br>";
    echo $_SESSION['sum'];
    echo "<br>";
    echo $_SESSION['diceNeeded'];
} else {

    //page load
    session_unset();
    $_SESSION['diceNeeded'] = 3;
    $_SESSION['sum'] = 0;
    $_SESSION['rolledDice'] = array();
    $_SESSION['diceKept'] = array();
    $count = 0;
    $msg = "<p><b><i> The goal is to keep your sum under 11! keep a die each time and good luck!</i></b></p>";
}
if (isset($_POST['reset'])) {
    session_unset();
    $_SESSION['diceNeeded'] = 3;
    $_SESSION['sum'] = 0;
    $_SESSION['rolledDice'] = array();
    $_SESSION['diceKept'] = array();
    $count = 0;
    $msg = "<p><b><i> The goal is to keep your sum under 11! keep a die each time and good luck!</i></b></p>";
}








?>



<html>
<meta charset='UTF_8'>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">


<body>
    <h1> Dice Game </h1>
    <?php echo $msg;
    echo "<br><p><b>Your total is:" . $_SESSION['sum'];

    ?>

    <form method='POST' action='<?php echo $_SERVER['PHP_SELF']; ?>'>
        <table>
            <tr>
                <?php
                if (isset($_POST['submitButton'])) {
                    for ($x = 0; $x <= $_SESSION['diceNeeded']; $x++) {
                        echo "<td>";
                        echo "<img src='imgs/" . $_SESSION['rolledDice'][$x] . ".jpg'>";
                        echo "</td>";
                    }
                }

                ?>
            </tr>
            <tr>
                <?php
                if (isset($_POST['submitButton'])) {
                    for ($x = 0; $x <= $_SESSION['diceNeeded']; $x++) {
                        echo "<td>";
                        echo "<input type='radio' name='dieSelected' value='" . $_SESSION['rolledDice'][$x] . "'>";
                        echo "</td>";
                    }
                }

                ?>
            </tr>
            <tr>
                <td>
                    <?php
                    if ($_SESSION['diceNeeded'] >= 0) {
                        echo "<input type='submit' name='submitButton' value='pick die'>";
                    }

                    ?>
                    <input type='submit' name='reset' value='reset'>

                </td>
            </tr>
        </table>
    </form>
</body>



</html>