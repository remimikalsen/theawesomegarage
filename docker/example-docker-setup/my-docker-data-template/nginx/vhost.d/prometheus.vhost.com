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
client_max_body_size 0;
chunked_transfer_encoding on;
auth_basic           "Mikalsen access";
auth_basic_user_file /etc/nginx/.htpasswd;
autoindex on; 
