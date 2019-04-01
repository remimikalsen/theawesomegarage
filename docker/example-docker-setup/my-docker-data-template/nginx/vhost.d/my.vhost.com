# Owncloud requires 20G as per the containers php settings
# Rename this file to the name of your virtual host. NO .conf ending!
client_max_body_size 20G;
