location /login {
  limit_req zone=credentials_ip burst=6 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=credentials_uri burst=10 nodelay;
  proxy_pass http://grafana.vhost.com;
}

location /api {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=dashboard_uri burst=240 nodelay;
  proxy_pass http://grafana.vhost.com;
}

