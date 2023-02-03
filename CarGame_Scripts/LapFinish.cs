using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class LapFinish : MonoBehaviour
{

    public GameObject FinishlineTrig;
    public GameObject HalfwayTrig;
    public float GameTime;
    public TextMeshProUGUI minutes;
    public TextMeshProUGUI seconds;
    public TextMeshProUGUI milis;
    public GameObject LapTimeBox;
    public TextMeshProUGUI LapCounter;
    public int LapNumber;
    public GameObject raceFinish;
    public TextMeshProUGUI WinCheck;
    public int AI_Laps;

    void Start(){
    LapNumber = 1;
    // AI_Laps = 1;
    }

    
    void OnTriggerEnter(Collider collision){
        
        if(collision.gameObject.tag == "Player"){
            LapNumber++;
            if(LapNumber == 3){
                raceFinish.SetActive(true);
                WinCheck.text = "You Win!";
                Debug.Log("You Won!");           
            }else{               
                GameTime = PlayerPrefs.GetFloat("GameTime");
                if(LapTimes.GameTime < GameTime){
                    if(LapTimes.secondCount <= 9){
                        seconds.text = "0" + LapTimes.secondCount + ".";
                    }else{
                        seconds.text = LapTimes.secondCount + ".";
                    }
                    if(LapTimes.minuteCount <= 9){
                        minutes.text = "0" + LapTimes.minuteCount + ".";
                    }else{
                        minutes.text = LapTimes.minuteCount + ".";
                    }
                    milis.text = "" + LapTimes.miliCount.ToString("0");
                
                    PlayerPrefs.SetInt("MinSave", LapTimes.minuteCount);
                    PlayerPrefs.SetInt("SecSave", LapTimes.secondCount);
                    PlayerPrefs.SetFloat("miliSave", LapTimes.miliCount);
                    PlayerPrefs.SetFloat("GameTime", LapTimes.GameTime);
                }
            }
        
        


            LapTimes.minuteCount = 0;
            LapTimes.secondCount = 0;
            LapTimes.miliCount = 0;
        

            LapCounter.text = "" + LapNumber;

            HalfwayTrig.SetActive(true);
            FinishlineTrig.SetActive(false);
        }else{
            AI_Laps++;
        }

    }

}

