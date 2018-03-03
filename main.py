import server
from waitress import serve


def main():
    serve(server.app, port=5001)

if __name__ == '__main__':
    main()
