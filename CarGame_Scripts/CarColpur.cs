using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CarColpur : MonoBehaviour
{
    public GameObject RedBody;
    public GameObject BlueBody;
    public GameObject GreenBody;
    public int CarVar;
    void Start()
    {
        CarVar = GlobalCar.CarType;
        if(CarVar == 1){
            RedBody.SetActive(true);
        }
        if(CarVar == 2){
            BlueBody.SetActive(true);
        }
        if(CarVar == 3){
            GreenBody.SetActive(true);
        }
    }

}
