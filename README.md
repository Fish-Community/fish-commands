# Fish commands

A monolithic plugin that handles all custom features for the >|||>Fish servers. Created by Brandons404, rewritten by BalaM314.

**Before reading the code, see [docs/info.md](docs/info.md).**

## Clean and easy to use commands system
Example code:
![image](docs/intellisense.png)
![image](docs/menus.png)
![image](docs/fail.png)

List of notable features:
* Low-boilerplate argument handling system that supports arguments of various types, and optional arguments. Automatically generates an error if one of the args is invalid (eg, specifying a team that does not exist, or an ambiguous player name).
* Intellisense for the arguments (The IDE will see `args: ["team:team?"]` and correctly type `args.team` as `Team | null`)
* Callback-based menu system with builtin permission safety
* Command handlers are provided with the command's usage stats (how long ago the command was used, etc)
* Tap handling system
* Permission handling system
* Easy failing with fail() and its associated pattern
* Automatically allows using a menu to resolve arguments left blank

Interested in contributing? See [CONTRIBUTING.md](CONTRIBUTING.md), and thanks in advance!

Contributors:

[<img width=80 alt="Brandons404" src="https://github.com/Brandons404.png">](https://github.com/Brandons404/)
[<img width=80 alt="BalaM314" src="https://github.com/BalaM314.png">](https://github.com/BalaM314/)
[<img width=80 alt="TheEt1234" src="https://github.com/TheEt1234.png">](https://github.com/TheEt1234/)
[<img width=80 alt="buthed010203" src="https://github.com/buthed010203.png">](https://github.com/buthed010203/)

[<img width=80 alt="Jurorno9" src="https://github.com/Jurorno9.png">](https://github.com/Jurorno9/)
[<img width=80 alt="Dart25" src="https://github.com/Dart25.png">](https://github.com/Dart25/)
[<img width=80 alt="juni-purr" src="https://github.com/juni-purr.png">](https://github.com/juni-purr/)
[<img width=80 alt="omnerom" src="https://github.com/omnerom.png">](https://github.com/omnerom/)

[<img width=80 alt="Darthscion" src="https://github.com/Darthscion55.png">](https://github.com/Darthscion55/)
[<img width=80 alt="cudspent" src="https://github.com/spentcud.png">](https://github.com/spentcud/)
[<img width=80 alt="Peanutzy" src="https://github.com/Peanutzy1.png">](https://github.com/Peanutzy1/)

Join our Discord: [https://discord.gg/VpzcYSQ33Y](https://discord.gg/VpzcYSQ33Y)

