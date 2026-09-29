using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraStable : MonoBehaviour
{
    public GameObject racer;
    public float Xaxis;
    public float Yaxis;
    public float Zaxis;
    // Start is called before the first frame update


    // Update is called once per frame
    void Update()
    {
        Xaxis = racer.transform.eulerAngles.x;
        Yaxis = racer.transform.eulerAngles.y;
        Zaxis = racer.transform.eulerAngles.z;

        transform.eulerAngles = new Vector3(Xaxis-Xaxis, Yaxis, Zaxis - Zaxis);
    }
}
