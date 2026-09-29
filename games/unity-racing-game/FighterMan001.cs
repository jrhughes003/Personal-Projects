using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FighterMan001 : MonoBehaviour
{
    public GameObject Tracker;
    public GameObject AI_001;
    public GameObject AI_002;
    public GameObject AI_003;
    public GameObject AI_004;
    public GameObject AI_005;
    public GameObject AI_006;
    public GameObject AI_007;
    public GameObject AI_008;
    public GameObject AI_009;
    public GameObject AI_010;
    public GameObject AI_011;
    public GameObject AI_012;
    public GameObject AI_013;
    public GameObject AI_014;
    public GameObject AI_015;
    public GameObject AI_016;
    public GameObject AI_017;
    public GameObject AI_018;
    public GameObject AI_019;
    public GameObject AI_020;
    public GameObject AI_021;
    public GameObject AI_022;
    public GameObject AI_023;
    public GameObject AI_024;
    public GameObject AI_025;
    public GameObject AI_026;
    public GameObject AI_027;
    public GameObject AI_028;
    public GameObject AI_029;
    public GameObject AI_030;
    public GameObject AI_031;
    public GameObject AI_032;
    public GameObject AI_033;
    public GameObject AI_034;
    public int TrackTracker;

    // Update is called once per frame
    void Update()
    {
//tracl
        if(TrackTracker == 0){
            Tracker.transform.position = AI_001.transform.position;
        }
        if(TrackTracker == 1){
            Tracker.transform.position = AI_002.transform.position;
        }
        if(TrackTracker == 2){
            Tracker.transform.position = AI_003.transform.position;
        }
        if(TrackTracker == 3){
            Tracker.transform.position = AI_004.transform.position;
        }
        if(TrackTracker == 4){
            Tracker.transform.position = AI_005.transform.position;
        }
        if(TrackTracker == 5){
            Tracker.transform.position = AI_006.transform.position;
        }
        if(TrackTracker == 6){
            Tracker.transform.position = AI_007.transform.position;
        }
        if(TrackTracker == 7){
            Tracker.transform.position = AI_008.transform.position;
        }
        if(TrackTracker == 8){
            Tracker.transform.position = AI_009.transform.position;
        }
        if(TrackTracker == 9){
            Tracker.transform.position = AI_010.transform.position;
        }
        if(TrackTracker == 10){
            Tracker.transform.position = AI_011.transform.position;
        }
        if(TrackTracker == 11){
            Tracker.transform.position = AI_012.transform.position;
        }
        if(TrackTracker == 12){
            Tracker.transform.position = AI_013.transform.position;
        }
        if(TrackTracker == 13){
            Tracker.transform.position = AI_014.transform.position;
        }
        if(TrackTracker == 14){
            Tracker.transform.position = AI_015.transform.position;
        }
        if(TrackTracker == 15){
            Tracker.transform.position = AI_016.transform.position;
        }
        if(TrackTracker == 16){
            Tracker.transform.position = AI_017.transform.position;
        }
        if(TrackTracker == 17){
            Tracker.transform.position = AI_018.transform.position;
        }
        if(TrackTracker == 18){
            Tracker.transform.position = AI_019.transform.position;
        }
        if(TrackTracker == 19){
            Tracker.transform.position = AI_020.transform.position;
        }
        if(TrackTracker == 20){
            Tracker.transform.position = AI_021.transform.position;
        }
        if(TrackTracker == 21){
            Tracker.transform.position = AI_022.transform.position;
        }
        if(TrackTracker == 22){
            Tracker.transform.position = AI_023.transform.position;
        }
        if(TrackTracker == 23){
            Tracker.transform.position = AI_024.transform.position;
        }

        if(TrackTracker == 24){
            Tracker.transform.position = AI_025.transform.position;
        }if(TrackTracker == 25){
            Tracker.transform.position = AI_026.transform.position;
        }
        if(TrackTracker == 26){
            Tracker.transform.position = AI_027.transform.position;
        }
        if(TrackTracker == 27){
            Tracker.transform.position = AI_028.transform.position;
        }
        if(TrackTracker == 28){
            Tracker.transform.position = AI_029.transform.position;
        }
        if(TrackTracker == 29){
            Tracker.transform.position = AI_030.transform.position;
        }
        if(TrackTracker == 30){
            Tracker.transform.position = AI_031.transform.position;
        }
        if(TrackTracker == 31){
            Tracker.transform.position = AI_032.transform.position;
        }
        if(TrackTracker == 32){
            Tracker.transform.position = AI_033.transform.position;
        }
        if(TrackTracker == 33){
            Tracker.transform.position = AI_034.transform.position;
        }
        

    }
    IEnumerator OnTriggerEnter(Collider collision){
        if(collision.gameObject.tag == "FighterMan01"){
            this.GetComponent<BoxCollider>().enabled = false;
            TrackTracker += 1;
            if(TrackTracker == 33){
                TrackTracker = 0;
            }
            yield return new WaitForSeconds (1);
            this.GetComponent<BoxCollider>().enabled = true;
        }
    }
}
