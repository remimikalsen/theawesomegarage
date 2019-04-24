client_max_body_size 0;
chunked_transfer_encoding on;
auth_basic           "Kibana access";
auth_basic_user_file /etc/nginx/.htpasswd;
autoindex on; 

location /api {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=dashboard_uri burst=240 nodelay;
  proxy_pass http://kibana.vhost.com;
}

location /elasticsearch {
  limit_req zone=dashboard_ip burst=150 nodelay;
  limit_req zone=whitelisted_ip burst=500 nodelay;
  limit_req zone=dashboard_uri burst=240 nodelay;
  proxy_pass http://kibana.vhost.com;
}

