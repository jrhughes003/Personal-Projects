using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Countdown : MonoBehaviour
{
    public TextMeshProUGUI Starter;
    public AudioSource GetReady;
    public AudioSource GoAudio;
    public GameObject LapTimer;
    public GameObject Car;
    public GameObject AI_Car;
    private Rigidbody rb;
    private Rigidbody AI_rb;


    // Start is called before the first frame update
    void Start()
    {
       StartCoroutine(CountBegin()); 
       rb = Car.GetComponent<Rigidbody>();
       AI_rb = AI_Car.GetComponent<Rigidbody>();

       rb.constraints = RigidbodyConstraints.FreezePosition;


        AI_rb.constraints = RigidbodyConstraints.FreezePosition;

    }

    IEnumerator CountBegin(){
        for(int x = 3; x > 0; x--){
        yield return new WaitForSeconds(0.5f);
        Starter.text = x.ToString();
        GetReady.Play();
        Starter.enabled = true;
        yield return new WaitForSeconds(0.5f);
    }
        Starter.enabled = false;
        yield return new WaitForSeconds(0.5f);
        GoAudio.Play();
        LapTimer.SetActive(true);
        rb.constraints = RigidbodyConstraints.None;
       AI_rb.constraints = RigidbodyConstraints.None;

       
    }


}
        // Starter.text = "2";
        // Starter.enabled = true;
        // yield return new WaitForSeconds(1.0f);
        // Starter.enabled = false;
        // Starter.text = "1";
        // Starter.enabled = true;
        // yield return new WaitForSeconds(1.0f);
        // Starter.enabled = false;