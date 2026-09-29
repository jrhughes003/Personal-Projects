# Recycling Robot Controller

Control code for a simulated recycling system (university design project). A robotic arm and servo table identify each container, then a mobile robot (Quanser QBot) follows coloured lines to deliver it to the correct bin.

**Tech:** Python, Quanser simulation library

## How it works

1. **Dispense** a random container onto the servo table.
2. **Classify** it by combining inductive, photoelectric, and load-cell readings to decide the material and destination bin.
3. **Transfer** containers onto the robot — up to three, as long as they share a bin and stay under the 90 g load limit.
4. **Deliver** by following the line, using the colour sensor to spot the target bin and the ultrasonic sensor to stop in front of it, then dump the load and return home.

## Running

The script depends on the course-provided `Common.project_library` and the Quanser simulation environment, which aren't included here. Settings such as the IP address, servo angles, and bin colours are at the top of `recycling_robot.py`.
