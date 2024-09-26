git pull

poetry install
# kill process by port
sudo kill -9 $(sudo lsof -t -i:9000)

nohup poetry run python saveit/main.py &

