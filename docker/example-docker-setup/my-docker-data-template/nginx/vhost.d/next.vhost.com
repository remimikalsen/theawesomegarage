# Nextcloud needs more than the default Nginx max body size. Adjust if needed.
# Rename this file to the name of your virtual host. NO .conf ending!
client_max_body_size 20G;
