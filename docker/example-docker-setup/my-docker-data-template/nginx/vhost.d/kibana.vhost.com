client_max_body_size 0;
chunked_transfer_encoding on;
auth_basic           "Kibana access";
auth_basic_user_file /etc/nginx/.htpasswd;
autoindex on; 
