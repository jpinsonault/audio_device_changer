import subprocess
from flask import Flask, request, jsonify, send_from_directory
import delegator
import utils
from pathlib import Path


windows_max_volume = 65535
home = str(Path.home())
nircmd_path = f"{home}\\bin\\nircmd\\nircmdc.exe"


app = Flask(__name__, static_url_path='/')


@app.route("/")
def blah():
    return app.send_static_file('index.html')


@app.route("/getSystemInfo")
def get_system_info():
    return jsonify(systemVolume=str(utils.get_volume_percent()),
                   audioDevices=utils.get_audio_devices(),
                   defaultInput=utils.get_default_input(),
                   defaultOutput=utils.get_default_output())


@app.route("/setAppVolume")
def set_app_volume():
    app_name = request.args.get('app')
    volume_percent = float(request.args.get('volume'))

    run_set_app_volume(app_name, volume_percent)
    return "success"


# localhost:5001/setSystemVolume?volume=0.5
@app.route("/setSystemVolume")
def set_system_volume():
    try:
        volume_percent = float(request.args.get('volume'))
        volume_int = int(volume_percent * windows_max_volume)

        cmd = run_set_system_volume(volume_int)
        return "success"
    except Exception as e:
        return str(e)


@app.route("/setAudioDevice")
def set_audio_device():
    device = request.args.get('audioDevice')
    run_set_audio_device(device)
    return "success"


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory("js", path)


def run_command(command):
    print("Running '{}'".format(command))
    call = delegator.run(command)

    print(call.out)

    return call


def run_set_app_volume(app_name, volume_percent):
    return run_command("{} {} {}".format(nircmd_path, app_name, volume_percent))


def run_set_system_volume(volume_int):
    return run_command("{} setsysvolume {}".format(nircmd_path, volume_int))


def run_set_audio_device(device_name):
    # Windows has different roles for audio devices. Setting all 3 mimics what would happen
    # if you pressed the "Set Default" button in the Sound settings window ¯\(ツ)/¯
    for role_id in [0, 1, 2]:
        run_command(f"{nircmd_path} setdefaultsounddevice \"{device_name}\" {role_id}")
