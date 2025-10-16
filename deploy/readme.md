# How to deploy

```sh
sudo cp deploy/proftwist-front.service /etc/systemd/system/proftwist-front.service
sudo systemctl daemon-reload
sudo systemctl enable --now proftwist-front
```
