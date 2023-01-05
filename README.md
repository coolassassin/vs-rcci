# Create or Update React Component tool

This extension is a VSCode integration with powerful CLI [reactcci](https://kamenskih.gitbook.io/reactcci/), which allows you to create and update your components with your own structure.  

![Example](https://raw.githubusercontent.com/coolassassin/vs-rcci/master/preview.gif)

## Features

- Create and update component by explorer context menu
- Wide configuration capabilies by config file (`rcci.config.js`, this file will be created after the first run of reactcci)

## Configuration posibilities
1. Structure of component (files, folders, conditional files, etc.)
2. File templates (you can code your own placeholder with any logic)
3. Actions after create (prettier, eslint, add to git and etc.)
4. Case settings for files and folders
5. Monorepository option to use same config in many projects
6. Create not only components. You can generate tests, apis, redux actions and reducers. Almost, everything

And way more small but powerfull features you can find [here](https://kamenskih.gitbook.io/reactcci/).

## Requirements

To use this extension you need to install **reactcci package** and run it for initialization:
```
# npm i --save-dev reactcci
# npx rcci
```
Same commands for yarn:
```
# yarn add --dev reactcci
# yarn run rcci
```

After that you will have config file (`rcci.config.js`) and templates folder to describe your component structure. For more details read the [instruction](https://github.com/coolassassin/reactcci/blob/master/README.md).

## Settings
- `root`: This setting let you set up the folder with installed reactcci and config file (rcci.config.js). Default root is the opened folder. (It is better to set this for `Workspace`, not for `User`, to avoid errors in another projects)
- `silent`: This setting lets you to disable showing terminal for reactcci. By default it will be shown up to let you set up everything, but in the long term using it can be annoying. So, turn it on and enjoy.