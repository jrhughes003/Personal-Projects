using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NewBehaviourScript : MonoBehaviour
{
    public GameObject LapDoneTrig;
    public GameObject HalfTrig;
    // Start is called before the first frame update
    public void OnTriggerEnter(Collider other){
        Debug.Log("This works");
        LapDoneTrig.SetActive(true);
        HalfTrig.SetActive(false);
    }
}
