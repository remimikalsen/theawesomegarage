## Start of configuration add by letsencrypt container
location ^~ /.well-known/acme-challenge/ {
    auth_basic off;
    auth_request off;
    allow all;
    root /usr/share/nginx/html;
    try_files $uri =404;
    break;
}
## End of configuration add by letsencrypt container

location /login {
  limit_req zone=credentials_ip burst=6 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=credentials_uri burst=10 nodelay;
  proxy_pass http://grafana.vhost.com;
}

location ~ ^/(?!(login)) {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=dashboard_uri burst=240 nodelay;
  proxy_pass http://grafana.vhost.com;
}

