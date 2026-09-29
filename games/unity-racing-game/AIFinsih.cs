using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class AIFinsih : MonoBehaviour
{

public int AI_Laps;
public TextMeshProUGUI WinCheck;
public GameObject AI_Finish;
public GameObject AI_Half;
public GameObject raceFinish;
public GameObject RegFinishTrig;


void Start(){
    AI_Laps = 1;
}
public void OnTriggerEnter(Collider other){
    if(other.gameObject.tag == "FighterMan01"){
        AI_Half.SetActive(true);
        AI_Finish.SetActive(false);       
        Debug.Log("AI FInish Line Crossed");
        AI_Laps++;
        if(AI_Laps == 3){
            RegFinishTrig.SetActive(false);
            raceFinish.SetActive(true);
            WinCheck.text = "You Lose";
            
        }

        AI_Half.SetActive(true);
        AI_Finish.SetActive(false);
    }
}
}
