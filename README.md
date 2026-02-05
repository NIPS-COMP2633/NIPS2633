# Deployment

Deployed at <https://my-schedule-sync.netlify.app/>

[![Netlify Status](https://api.netlify.com/api/v1/badges/9ef6f1cf-b7d9-4963-af20-49bd1ba99ff2/deploy-status)](https://app.netlify.com/projects/my-schedule-sync/deploys)

---

### Scripts

Scripts that execute client-side should go into:
`src/client-side-scripts/`.

Scripts that execute server-side should go into:
`src/server-side-scripts/`.

## WSL reference

WSL is a lightweight virtual machine. It lives on your local machine, and is a *seperate operating system*. Once installed, open the WSL terminal and clone the repository inside WSL. Begin setup from here.

Contributors: [@PkHutch](https://github.com/PkHutch), [@sudonym-i](https://github.com/sudonym-i/), [@naveede1](https://github.com/naveede1)

## React installation

### Install node

`sudo apt install nodejs npm` for WSL.

OR

`brew install node` for mac.

Move into the uni-cal directory.

`cd uni-cal`
run `npm install`

**React reference can be found at [uni-cal/REACT_REFERENCE.md](uni-cal/REACT_REFERENCE.md)**

Run development server by using:

`cd uni-cal && npm start`
