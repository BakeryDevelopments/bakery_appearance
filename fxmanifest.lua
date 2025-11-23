fx_version 'cerulean'
game 'gta5'
use_experimental_fxv2_oal 'yes'
lua54 'yes'

author 'pf_scripts'
description 'Basic Lua & (React + Vite + Mantine) boilerplate for FiveM'
repository 'https://github.com/PFScripts/fivem_react_vite_mantine_boilerplate'

shared_scripts {'@ox_lib/init.lua', 'shared/*.lua'}

client_scripts {'client/functions/*.lua','client/*.lua'}

server_scripts {'server/*.lua'}

ui_page 'web/build/index.html'

files {'modules/nui.lua', 'web/build/index.html', 'web/build/**/*'}