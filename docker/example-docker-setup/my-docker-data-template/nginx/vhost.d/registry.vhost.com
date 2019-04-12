# Rename this file to the name of your virtual host. NO .conf ending!
client_max_body_size 0;
chunked_transfer_encoding on;

