import server
from waitress import serve
import json

from utils import get_audio_devices


def main():
    serve(server.app, port=5001)

if __name__ == '__main__':
    main()
