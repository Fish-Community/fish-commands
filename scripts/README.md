# scripts

This folder contains scripts used to assist with development. This is **not** the scripts folder for the plugin, that is in [/build/scripts](/build/scripts).

`build-yopta.js` compiles the `.yopta` source modules in `/src` with the original YoptaScript compiler and writes the Mindustry JavaScript modules to `/build/scripts`. Custom names for Mindustry APIs are listed in [yopta-dictionary.js](yopta-dictionary.js); the build restores those aliases to the original JavaScript API names.
