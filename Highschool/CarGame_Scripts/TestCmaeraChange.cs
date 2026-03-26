using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestCmaeraChange : MonoBehaviour
{
    public GameObject NormalCam;
    public GameObject ReverseView;
    public GameObject FPView;
    public int CamCheck;

    // Update is called once per frame
    void Update()
    {
        if(Input.GetButtonDown ("CamChange")){
            if(CamCheck == 2){
                CamCheck = 0;  
            }else{
                CamCheck++;
            }
            StartCoroutine (ModeChange());
        }
    }
    IEnumerator ModeChange(){
        yield return new WaitForSeconds (0.01f);
        if(CamCheck == 0){
            NormalCam.SetActive(true);
            FPView.SetActive(false);
        }
                if(CamCheck == 1){
            ReverseView.SetActive(true);
            NormalCam.SetActive(false);
        }
                if(CamCheck == 2){
            FPView.SetActive(true);
            ReverseView.SetActive(true);
        }
    }
}


