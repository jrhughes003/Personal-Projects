using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;



public class LapTimes : MonoBehaviour
{

public static float miliCount;
public static int secondCount;
public static int minuteCount;
public static string miliDisplay;
public static float GameTime;
public TextMeshProUGUI minutes;
public TextMeshProUGUI seconds;
public TextMeshProUGUI milis;



    // Update is called once per frame
    void Update()
    {
        miliCount += Time.deltaTime * 10;
        GameTime += Time.deltaTime;
        miliDisplay = miliCount.ToString("f0");
        milis.text = "" + miliDisplay;

        if(miliCount > 9){
            miliCount = 0;
            secondCount += 1;
        }
        if(secondCount <= 9){
            seconds.text = "0" + secondCount + ".";
        }else{
            seconds.text = secondCount + ".";
        }
        if(secondCount == 60){
            secondCount = 0;
            minuteCount += 1;
        }
        if(minuteCount <= 9){
                        minutes.text = "0" + minuteCount + ":";
        }else{
            minutes.text = minuteCount + ".";
        }
    }
}
