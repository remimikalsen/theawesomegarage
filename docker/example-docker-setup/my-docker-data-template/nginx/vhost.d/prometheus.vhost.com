# Rename this file to the name of your virtual host. NO .conf ending!
# Read the nginx/auth/README file to set up auth_basic correctly
client_max_body_size 0;
chunked_transfer_encoding on;
auth_basic           "Prometheus Access";
auth_basic_user_file /etc/nginx/.htpasswd;
autoindex on; 
