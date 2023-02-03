using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityStandardAssets.Vehicles.Car;
using TMPro;

public class RaceEnd : MonoBehaviour
{
    public TextMeshProUGUI LapText;
    public GameObject Car;
    public GameObject FinishCam;
    public GameObject CamChanges;
    public GameObject CompleteTrig;
    public string WinCheck;
    // Start is called before the first frame update
    void OnTriggerEnter()
    {
        // LapText.text = "Done";
        // Car.SetActive(false);
        // CompleteTrig.SetActive(false);
        // CarController.m_Topspeed = 10.0f;
        // Car.GetComponent<CarController>().enabled = false;
        // Car.GetComponent<CarUserControl>().enabled = false;
        // Car.SetActive(true);
        // FinishCam.SetActive(true);
        // CamChanges.SetActive(false);

        Car.GetComponent<CarUserControl>().enabled = false;
        FinishCam.SetActive(true);
        FinishCam.SetActive(false);
        
    }

}
