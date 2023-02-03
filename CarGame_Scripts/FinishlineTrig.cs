using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FinishlineTrig : MonoBehaviour
{
    public GameObject LapDoneTrig;
    public GameObject HalfDoneTrig;

    void OnTriggerEnter(){
        LapDoneTrig.SetActive(false);
        HalfDoneTrig.SetActive(true);
    }
}
