using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class HalfwayTrig : MonoBehaviour
{
    public GameObject LapDoneTrig;
    public GameObject HalfDoneTrig;

    public void OnTriggerEnter(Collider other){
        if(other.gameObject.tag == "ME"){
            Debug.Log("This Works");
            LapDoneTrig.SetActive(true);
            HalfDoneTrig.SetActive(false);
        }
    }
}
