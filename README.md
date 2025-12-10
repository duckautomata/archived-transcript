# archived-transcript

Website to view transcripts from past streams.

## Overview

_System_

- **[Archived Transcript System](#archived-transcript-system)**
- **[Guide](#guide)**

_Development_

- **[Tech Used](#tech-used)**
- **[Running Locally](#running-locally)**
- **[Contributing](#contributing)**
- **[Contributing Ideas](#contributing-ideas)**
- **[Building a Release](#building-a-new-release)**
- **[Release Process](#release-process)**

## System

### Archived Transcript System

Archived Transcript is a system that contains three programs:

- Data: [dokiscripts-data](https://github.com/duckautomata/dokiscripts-data)
- Server: [archived-transcript-server](https://github.com/duckautomata/archived-transcript-server)
- Client: [archived-transcript](https://github.com/duckautomata/archived-transcript)

All three programs work together to transcribe all streams/videos/content and allows anyone to search through and view them.

- Data will transcribe the content, stores the `.srt` files in git for safekeeping, and uploads the `.srt` files to the server. All of these steps are manually triggered.
- Server will receive `.srt` files from Data and store them into a database. Upon request from the Client, it will search through the data base and return the requested data.
- Client (this) is the UI that renders the transcript for us to use.

### Guide

A guide on how to use the website can be found by clicking the `Help` question mark icon on the sidebar.

![help button](/docs/help-button.png)

## Development

### Tech Used

- Node 22
- Vite to run locally
- React19
- MUI 7

### Running Locally

1. Have Node 20 or later installed
2. Clone the repo locally
3. Run `npm install` to install dependencies
4. Run `npm run dev` and open the site it gives you. Or press `o` and enter to open the site.

Every time you save, Vite will automatically refresh the cache and the site should refresh with the new changes.

### Contributing

1. create a branch and put your code onto it.
2. Run `npm run test`, `npm run format`, `npm run lint` and make sure everything is all good.
3. Push, raise pr, I'll approve.

### Contributing ideas

Raise an issue and detail what idea you have or would like to see.

### Building a new release

This repo holds the dev code. The release code is stored on the `duckautomata.github.io` repo.
I do it this way to ensure that I only have one GitHub Pages repo. And it makes it easier to integrate all apps and make it look consistent.

#### Release Process

Once a new version of the app is ready to go.

1. Run `npm run build`
2. Copy the contents of `/archived-transcript` and paste them into this repos folder over in the `duckautomata.github.io` repo. (make sure to delete the existing folder first)
3. Push changes to a new branch and open a PR.
4. Once PR is merged. Changes should be released.
