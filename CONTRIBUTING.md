
# Contributing

What kind of changes do you want to make?

## I want to make small changes, i.e.; changing some text.

You can make these changes entirely through the GitHub website. You will need a GitHub account.

1. Open the file that you want to edit. If you are unsure of which file to edit, try using GitHub's search feature. Edit the `.yopta` source file in `src/`, not the generated files in `build/scripts/`.
2. Click the edit icon in the toolbar. If GitHub tells you to create a fork, do that.
3. Make your change, then click "Commit changes..."
4. Write a message, then click Propose changes.
  - If you are a member of the Fish-Community org, you will see a message about branch protection. Select "Create a new branch and start a pull request".
  - The generated JavaScript in `build/scripts/` is refreshed by the build and should not be edited by hand.
5. Create a pull request and request a review. If you see a message about failing checks, there may be a problem with your changes.

## I want to make significant code changes (in VSCode)

First: read [info.md](docs/info.md)

To get started with development:
1. Create a fork of fish-commands through the GitHub website.
2. Clone that fork into a folder of your choice by `cd`ing into the folder and running `git clone https://github.com/`(your username here)`/fish-commands .`
3. Run `pnpm install`.
4. Run `pnpm watch` in one terminal to rebuild when `.yopta` source files change.
5. In another terminal, run `pnpm dev` to build the plugin and start a Mindustry development server with fish-commands installed.

### Making changes
1. Edit the code, which is in `/src`.
2. Restart the development server. Close it by pressing Ctrl+C or typing `exit`.
3. Test your changes.

To use fish-commands with a server installed somewhere else, run `npm attach [jarfilepath.jar]`

Once you have made and tested your changes, submit a PR:
1. Commit your changes to Git by running `git add . && git commit -m "`(description of your changes here)`"`
2. Upload your changes by running `git push`. 3. You should see a link to create the PR. If not, create one through GitHub.
