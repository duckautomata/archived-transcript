# archived-transcript

Website to view transcripts from past streams.

## Overview

_System_

- **[Archived Transcript System](#archived-transcript-system)**
- **[Guide](#guide)**

_Development_

- **[Tech Used](#tech-used)**
- **[Running Locally](#running-locally)**
- **[Testing](#testing)**
- **[Contributing](#contributing)**
- **[Contributing Ideas](#contributing-ideas)**
- **[Building a Release](#building-a-new-release)**

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
- MUI 9

### Running Locally

1. Have Node 22 or later installed
2. Clone the repo locally
3. Run `npm install` to install dependencies
4. Run `npm run dev` and open the site it gives you. Or press `o` and enter to open the site.

Every time you save, Vite will automatically refresh the cache and the site should refresh with the new changes.

### Testing

This project uses playwright tests only, no unit tests.

Before running any playwright tests, you need to build the project. The tests runs against the preview server since it's significantly faster than running the dev server.

#### Running Playwright Tests

```bash
npm run build
npm run test
```

#### Dev Playwright Tests

This will use the dev server instead of the preview server.

This is useful for catching rendering errors that are not logged in the preview server.

However, it is a lot slower than the preview server. So it should only be ran locally.

```bash
npm run test:dev
```

### Contributing

1. create a branch and put your code onto it.
2. Run `npm run test`, `npm run format`, `npm run lint` and make sure everything is all good.
3. Push, raise pr, I'll approve.

### Contributing ideas

Raise an issue and detail what idea you have or would like to see.

### Building a new release

New releases are automatically built and deployed when a new pull request is merged into master.
