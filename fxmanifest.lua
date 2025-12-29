fx_version 'cerulean'
game 'gta5'
use_experimental_fxv2_oal 'yes'
lua54 'yes'

author 'TechJess#0'
description 'Appearance Menu Inspired by bl_appearance with React/Vite/Mantine UI'
repository 'https://github.com/PFScripts/fivem_react_vite_mantine_boilerplate'

shared_scripts {'@ox_lib/init.lua', 'shared/*.lua'}

client_scripts {
  'client/**/*.lua'
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/**/*.lua'
}

-- ui_page 'web/build/index.html'
ui_page 'http://localhost:5173/' --for dev

files {
  'modules/*.lua',
  'web/build/index.html',
  'web/build/**/*',
  'shared/locale/*.json',
  'shared/data/*.json',
}

provide {
  'esx_skin',
  'skinchanger'
}