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
client_max_body_size 20G;

location ~ ^/(?!(login)) {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=credentials_uri burst=60 nodelay;
  proxy_pass http://next.vhost.com;
}
