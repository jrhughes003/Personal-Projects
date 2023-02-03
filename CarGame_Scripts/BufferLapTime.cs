using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class BufferLapTime : MonoBehaviour
{
    public int MinCount;
    public int SecCount;
    public float MiliCount;
    public TextMeshProUGUI MinDisplay;
        public TextMeshProUGUI SecDisplay;

    public TextMeshProUGUI MiliDisplay;

    // Start is called before the first frame update
    void Start()
    {
        MinCount = PlayerPrefs.GetInt("MinSave");
        SecCount = PlayerPrefs.GetInt("SecSave");
        MiliCount = PlayerPrefs.GetFloat("MiliSave");

        MinDisplay.text = "0" + MinCount.ToString() + ":";
        SecDisplay.text = SecCount.ToString() + ".";
        MiliDisplay.text = MiliCount.ToString();
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
