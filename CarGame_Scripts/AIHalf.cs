using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AIHalf : MonoBehaviour
{
    public GameObject AI_Half;
    public GameObject AI_Finish;

    void OnTriggerEnter (Collider other){
        if(other.gameObject.tag == "FighterMan01"){
            AI_Finish.SetActive(true);
            AI_Half.SetActive(false);
        }
    }
}
