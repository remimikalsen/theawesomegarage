auth_basic           "Cadvisor access";
auth_basic_user_file /etc/nginx/.htpasswd;
autoindex on;
