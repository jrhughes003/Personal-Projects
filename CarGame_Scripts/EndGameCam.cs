using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


public class EndGameCam : MonoBehaviour
{

    void Update()
    {
      StartCoroutine(BackToStart());
      transform.Rotate(0,1,0, Space.World);  
    }
    IEnumerator BackToStart(){
      yield return new WaitForSeconds(15f);
      SceneManager.LoadScene(0);
    }
}
