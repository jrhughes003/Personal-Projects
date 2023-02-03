using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MenuButtons : MonoBehaviour
{
    public void PlayGame (){
        SceneManager.LoadScene(2);
    }
        public void TrackSelect (){
        SceneManager.LoadScene(1);
    }
        public void MainMenu (){
        SceneManager.LoadScene(0);
    }
    public void NightTime (){
        SceneManager.LoadScene(5);
    }
    public void QuitGame(){
        Application.Quit();
    }
    public void WarmUp(){
        SceneManager.LoadScene(4);
    }
        public void Credits(){
        SceneManager.LoadScene(3);
    }
}
