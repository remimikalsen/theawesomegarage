# Nextcloud needs more than the default Nginx max body size. Adjust if needed.
# Rename this file to the name of your virtual host. NO .conf ending!
client_max_body_size 20G;
location /remote.php {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=regular_uri burst=10 nodelay;
  proxy_pass http://next.vhost.com;
}

location /ocs {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=regular_uri burst=10 nodelay;
  proxy_pass http://next.vhost.com;
}

location /index.php {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=regular_uri burst=10 nodelay;
  proxy_pass http://next.vhost.com;
}

