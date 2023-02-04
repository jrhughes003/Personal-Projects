from Common.project_library import *
import sys
sys.path.append('../')

# Modify the information below according to you setup and uncomment the entire section

# 1. Interface Configuration
project_identifier = 'P3B'  # enter a string corresponding to P0, P2A, P2A, P3A, or P3B
ip_address = '169.254.157.103'  # enter your computer's IP address
hardware = False  # True when working with hardware. False when working in the simulation

# 2. Servo Table configuration
short_tower_angle = 315  # enter the value in degrees for the identification tower
tall_tower_angle = 90  # enter the value in degrees for the classification tower
# 270# enter the value in degrees for the drop tube. clockwise rotation from zero degrees
drop_tube_angle = 180

# 3. Qbot Configuration
bot_camera_angle = 0  # angle in degrees between -21.5 and 0

# 4. Bin Configuration
# Configuration for the colors for the bins and the lines leading to those bins.
# Note: The line leading up to the bin will be the same color as the bin

bin1_offset = 0.10  # offset in meters
bin1_color = [0, 1, 0]  # e.g. [1,0,0] for red
bin2_offset = 0.14
bin2_color = [0, 0, 1]
bin3_offset = 0.13
bin3_color = [1, 0, 0]
bin4_offset = 0.15
bin4_color = [1, 1, 1]
# --------------- DO NOT modify the information below -----------------------------

if project_identifier == 'P0':
    QLabs = configure_environment(
        project_identifier, ip_address, hardware).QLabs
    bot = qbot(0.1, ip_address, QLabs, None, hardware)

elif project_identifier in ["P2A", "P2B"]:
    QLabs = configure_environment(
        project_identifier, ip_address, hardware).QLabs
    arm = qarm(project_identifier, ip_address, QLabs, hardware)

elif project_identifier == 'P3A':
    table_configuration = [short_tower_angle,
                           tall_tower_angle, drop_tube_angle]
    # Configuring just the table
    configuration_information = [table_configuration, None, None]
    QLabs = configure_environment(
        project_identifier, ip_address, hardware, configuration_information).QLabs
    table = servo_table(ip_address, QLabs, table_configuration, hardware)
    arm = qarm(project_identifier, ip_address, QLabs, hardware)

elif project_identifier == 'P3B':
    table_configuration = [short_tower_angle,
                           tall_tower_angle, drop_tube_angle]
    qbot_configuration = [bot_camera_angle]
    bin_configuration = [[bin1_offset, bin2_offset, bin3_offset, bin4_offset], [
        bin1_color, bin2_color, bin3_color, bin4_color]]
    configuration_information = [
        table_configuration, qbot_configuration, bin_configuration]
    QLabs = configure_environment(
        project_identifier, ip_address, hardware, configuration_information).QLabs
    table = servo_table(ip_address, QLabs, table_configuration, hardware)
    arm = qarm(project_identifier, ip_address, QLabs, hardware)
    bins = bins(bin_configuration)
    bot = qbot(0.1, ip_address, QLabs, bins, hardware)


# ---------------------------------------------------------------------------------
# STUDENT CODE BEGINS
# ---------------------------------------------------------------------------------


# This function will dispense a container, using a number as an input,
# and rotate it to the sensor
def detect_container(container):
    table.dispense_container(container)
    time.sleep(1)
    table.rotate_table_angle(90)

# given a list of data, the below function will calulate the average


def calc_avg(data):
    total = sum(data)
    points = len(data)
    avg = total / points
    return avg

# This function uses the detect container function to dispense a container, and then averages the
# data given form the inductive sensor using the calc_avg function.


def calc_avg_sensor_reading(container_id, sensor_time):
    detect_container(container_id)
    data = table.inductive_sensor(sensor_time)
    average = calc_avg(data)
    return average

# This function will use the photoelectric sensor and return a value of the average reading


def measure_photoelectric(duration):
    reading_list = []
    print("photoelelectric activated")
    data = table.photoelectric_sensor(duration)
    photoelectric_reading = calc_avg(data)
    photoelectric_reading = round(photoelectric_reading, 2)
    reading_list.append(photoelectric_reading)
    print(reading_list[0])

# This function will measure the mass of the bottle that is on the table. It subracts


def measure_mass(table_mass, container, duration):
    weight = table.load_cell_sensor(duration)
    weight_avg = calc_avg(weight)
    container_mass = weight_avg - table_mass
    return(container_mass)


# This function will use the measure_mass function as well as the calc_avg_sensor_reading, which uses the inductive sensor
# function in order to identify whether our container is metal or not, if it is not, it uses
# the photoelectric sensor to determine whether or not its paper or plastic, and the mass
# to determine it's recyclability
def classify_container(table_mass, container_id, sensor_time):
    output_list = []
    reading = calc_avg_sensor_reading(container_id, sensor_time)
    container_mass = measure_mass(table_mass, container_id, sensor_time)
    if reading < 4:
        data = table.photoelectric_sensor(sensor_time)
        photoelectric_reading = calc_avg(data)
        photoelectric_reading = round(photoelectric_reading, 2)

        if photoelectric_reading < 4:

            if container_mass > 9.85:
                bin_number = 4
                pickup_height = 0.3043
            else:
                bin_number = 3
                pickup_height = 0.3043
        else:
            if container_mass > 10.8:
                bin_number = 4
                pickup_height = 0.3043
            else:
                bin_number = 2
                pickup_height = 0.3043
    else:
        bin_number = 1
        pickup_height = 0.2843
    table_mass = table_mass + container_mass
    output_list.append(bin_number)
    output_list.append(table_mass)
    table.rotate_table_angle(270)
    return (output_list, container_mass, pickup_height)

# Transferring the bottle to the q-bot and giving the q-bot the right bin. this consists of
# using coordinates and the end effector.


def bottle_transfer(bin_number, dropoff, pickup_height):
    time.sleep(3)
    arm.move_arm(0.6397, 0.0, pickup_height)
    time.sleep(1)
    arm.control_gripper(38)
    time.sleep(1)
    arm.move_arm(0.406, 0.0, 0.483)
    time.sleep(2)
    arm.move_arm(dropoff[0], dropoff[1], dropoff[2])
    time.sleep(2)
    arm.control_gripper(-10)
    time.sleep(2)
    arm.rotate_shoulder(-45)
    time.sleep(2)
    arm.move_arm(0.406, 0.0, 0.483)
    arm.control_gripper(-28)
    number = bin_number
    if number == 1:
        rgbvalues = [0, 1, 0]
        goal_time = 14.0
        finish_time = 71.0
    if number == 2:
        rgbvalues = [0, 0, 1]
        goal_time = 26.0
        finish_time = 54.0
    if number == 3:
        rgbvalues = [1, 0, 0]
        goal_time = 53.0
        finish_time = 17.0
    if number == 4:
        rgbvalues = [1, 1, 1]
        goal_time = 71.0
        finish_time = 8.0
    return(rgbvalues, goal_time, finish_time)

# The next sections of code are split into specific segments because when a loop is searching through
# too many conditions at once, and pulling data from multiple sensors, it takes longer to check whether or not it
# is on the line which makes the bot less reliable.


# sending the q-bot to the right bin using a timed approach, and the using more specific line following
# functions within in order to make the bot run as smoothly as possible
def followline(rgbvalues, goal_time, finish_time):
    bot.rotate(110)
    time.sleep(2)
    drive = 1
    start_time = time.time()
    # while loop in order to keep pulling sensor values
    while drive == 1:
        sensor_values = bot.line_following_sensors()
        # if statements checking where the line is
        if sensor_values == [1, 1]:
            bot.set_wheel_speed([0.1, 0.1])
        if sensor_values == [0, 1]:
            bot.set_wheel_speed([0.075, 0.04])
        if sensor_values == [1, 0]:
            bot.set_wheel_speed([0.04, 0.075])
        end_time = time.time()
        total_time = end_time - start_time
        # the if statement below uses a predetertimed time to use a different line
        # following function, this one will use more sensor data, so we want to use
        # it or less time
        if total_time > goal_time:
            print(rgbvalues)
            dropoff_bottle(rgbvalues, finish_time)
            drive = 0

# This function uses the colour sensor and ultrasonic sensor in order to make sure
# it is in front of the correct bin, as well as make sure it is the right distance from that bin
# to drop off the containers


def dropoff_bottle(rgbvalues, finish_time):
    keep_driving = 1
    dumped = 0
    bot.activate_color_sensor()
    while keep_driving == 1:
        # same as line following function above, but now pulling more data in order to find when
        # it is close to the bin
        rgb_detected = (bot.read_color_sensor()[0])
        sensor_values = bot.line_following_sensors()
        if sensor_values == [1, 1]:
            bot.set_wheel_speed([0.05, 0.05])
        elif sensor_values == [1, 0]:
            bot.set_wheel_speed([0.01, 0.02])
        elif sensor_values == [0, 1]:
            bot.set_wheel_speed([0.02, 0.01])
        if dumped == 0:
            # once it is in range of the bin, it uses the ultrasonic sensor to find out when it is directly in front
            # of then bin, and then dumps its load
            if rgb_detected == rgbvalues:
                find_bin = 1
                bot.activate_ultrasonic_sensor()
                while find_bin == 1:
                    distance = bot.read_ultrasonic_sensor()
                    sensor_values = bot.line_following_sensors()
                    if sensor_values == [1, 1]:
                        bot.set_wheel_speed([0.05, 0.05])
                    elif sensor_values == [1, 0]:
                        bot.set_wheel_speed([0.01, 0.02])
                    elif sensor_values == [0, 1]:
                        bot.set_wheel_speed([0.02, 0.01])
                    if distance < 0.05:
                        bot.set_wheel_speed([0, 0])
                        bot.activate_linear_actuator()
                        bot.dump()
                        dumped = 1
                        bot.deactivate_linear_actuator()
                        find_bin = 0
                        # once we have dropped off the container, we no longer need all the
                        # sensor data, so we go to a different line following function to
                        # make it all more efficient
                        gohome(finish_time)
                        keep_driving = 0

# This function doesn't use any sensor data so the bot can travel faster while going back to the hub


def gohome(finish_time):
    drive = 1
    start_time = time.time()
    while drive == 1:
        sensor_values = bot.line_following_sensors()
        if sensor_values == [1, 1]:
            bot.set_wheel_speed([0.1, 0.1])
        if sensor_values == [0, 1]:
            bot.set_wheel_speed([0.075, 0.04])
        if sensor_values == [1, 0]:
            bot.set_wheel_speed([0.04, 0.075])
        end_time = time.time()
        total_time = end_time - start_time
        if total_time > finish_time:
            bot.set_wheel_speed([0, 0])
            drive = 0
            # Once our pretermined time is met, we use a different line following function
            # to get to the exact home position
            specific_home()

# this fuction uses the ultrasonic sensor to determine when it is home
# by checking how far it is from the bins. The speed is slower here so it can pull more values from the
# sensor to make sure the bot ends in the right spot


def specific_home():
    drive = 1
    bot.activate_ultrasonic_sensor()
    while drive == 1:
        distance = bot.read_ultrasonic_sensor()
        sensor_values = bot.line_following_sensors()
        if sensor_values == [1, 1]:
            bot.set_wheel_speed([0.05, 0.05])
        if sensor_values == [0, 1]:
            bot.set_wheel_speed([0.01, 0])
        if sensor_values == [1, 0]:
            bot.set_wheel_speed([0, 0.01])
        if distance >= 0.79:
            bot.set_wheel_speed([0, 0])
            bot.rotate(5)
            drive = 0


# We worked together to integrate the functions into one main loop that will recycle off into infinity.
# set neccessary variables for loops and contitions
running = 1
bottles_loaded = 0
bottles_on_table = 0
table_mass = 0
hopper_mass = 0
rotated = 0
# while loop with somewhat arbitrary value
while running == 1:
    # pull random container id
    container_id = random.randint(1, 6)
    # move bot towards arm
    if rotated == 0:
        bot.rotate(-105)
        time.sleep(1)
        rotated = 1
        bot.set_wheel_speed([0.1, 0.1])
        time.sleep(1)
        bot.set_wheel_speed([0, 0])
    # check if there is bottles on the table
    if bottles_on_table == 0:
        # dispense a bottle and store its info
        dispense_list = (classify_container(table_mass, container_id, 1.0))
        dispense_info = dispense_list[0]
        container_mass = dispense_list[1]
        bin_number = dispense_info[0]
        container_mass = dispense_info[1]
        pickup_height = dispense_list[2]
        bottles_on_table += 1
    # check if the q-bot isn't full
    if bottles_loaded < 3:
        if bottles_loaded != 0:
            # if theres already a bottle on the table, check if it is the same as what is in the bot
            if loaded_id == bin_number:
                # set dropoff location based on how many bottles are on the bot
                if bottles_loaded == 1:
                    dropoff = [0.04, -0.55, 0.52]
                if bottles_loaded == 2:
                    dropoff = [0.1, -0.55, 0.52]
                # set all neccessary values for line following functions below
                if hopper_mass + container_mass < 90:
                    info_list = bottle_transfer(
                        bin_number, dropoff, pickup_height)
                    hopper_mass = hopper_mass + container_mass
                    rgb_values = info_list[0]
                    goal_time = info_list[1]
                    finish_time = info_list[2]
                    # since a bottle was taken off the table, adjust variable accoridngly
                    bottles_on_table -= 1
                    bottles_loaded = bottles_loaded + 1
                    loaded_id = bin_number
                else:
                    followline(rgb_values, goal_time, finish_time)
                    hopper_mass = 0
                    bottles_loaded = 0
                    rotated = 0
            else:
                followline(rgb_values, goal_time, finish_time)
                hopper_mass = 0
                bottles_loaded = 0
                rotated = 0
        else:
            dropoff = [-0.02, -0.55, 0.52]
            if hopper_mass + container_mass < 90:
                info_list = bottle_transfer(bin_number, dropoff, pickup_height)
                hopper_mass = hopper_mass + container_mass
                rgb_values = info_list[0]
                goal_time = info_list[1]
                finish_time = info_list[2]
                bottles_on_table -= 1
                bottles_loaded = bottles_loaded + 1
                loaded_id = bin_number
            else:
                followline(rgb_values, goal_time, finish_time)
                hopper_mass = 0
                bottles_loaded = 0
                rotated = 0
    else:
        # send the bot out and reset neccesary variables
        followline(rgb_values, goal_time, finish_time)
        hopper_mass = 0
        bottles_loaded = 0
        rotated = 0

# ---------------------------------------------------------------------------------
# STUDENT CODE ENDS
# ---------------------------------------------------------------------------------
