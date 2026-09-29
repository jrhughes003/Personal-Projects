# Unity Racing Game

Gameplay scripts from a Unity racing game built in high school. Only the C# scripts are included here, not the full Unity project.

**Tech:** C#, Unity, TextMeshPro

## Features

- Car selection and colour choice from the main menu
- 3-2-1 countdown before the race starts
- AI opponents with halfway and finish-line checkpoints
- Lap timing with minutes/seconds/milliseconds display
- Camera switching and end-of-race camera

## Scripts

| Script | Purpose |
| --- | --- |
| `MenuButtons.cs`, `CarColpur.cs`, `GlobalCar.cs` | Menu, car selection, and choice carried between scenes |
| `Countdown.cs` | Race-start countdown |
| `LapTimes.cs`, `BufferLapTime.cs`, `LapFinish.cs` | Lap timer and best-lap tracking |
| `HalfwayTrig.cs`, `FinishlineTrig.cs` | Player checkpoints |
| `AIHalf.cs`, `AIFinsih.cs` | AI opponent checkpoints |
| `RaceEnd.cs`, `EndGameCam.cs` | End-of-race logic and camera |
| `CameraStable.cs`, `TestCmaeraChange.cs` | Camera stabilisation and cycling between normal, reverse, and first-person views |
| `FighterMan001.cs` | Manages the AI opponent cars |
| `Up.cs`, `Down.cs` | Power-up / power-down pickups (stubs) |
| `NewBehaviourScript.cs` | Early lap-trigger test |

To use them, copy the scripts into a Unity project's `Assets/` folder and attach them to the matching GameObjects.
