# How to Run Quick Commerce (Next.js Application)

This guide provides step-by-step instructions on how to clone, install dependencies, and run the Quick Commerce Next.js application.

## Prerequisites
Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (Recommended: 18 or later version)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) or any other code editor
- Refer .env.example to set up environment variables

## Clone the Repository
Open your terminal or command prompt and run:

```sh
git clone https://github.com/Shailendra-vi/quick-commerce.git
```

Navigate into the project directory:

```sh
cd quick-commerce
```

## Install Dependencies
Install all required dependencies using npm or yarn:

```sh
npm install
# or
yarn install
```

## Environment Setup
Create a `.env.local` file in the root directory and configure necessary environment variables. Refer to `.env.example` if available.

## Run the Development Server
Start the application in development mode:

```sh
npm run dev
# or
yarn dev
```

The app should now be running on `http://localhost:3000`

## Build and Start the Production Server
To build and start the production server:

```sh
npm run build
npm start
# or
yarn build
yarn start
```

## Authentication (SignUp)
1. Open `http://localhost:3000/signup`
2. Enter the required details and submit.

## Authentication (SignIn)
1. Open `http://localhost:3000/signin`
2. Enter the required details and submit.



## Configure AI Model
Configure .env.local using .env.example as a reference for setting up the AI model.
- If using Gemini, set the Gemini API key in the .env file.
- If using Ollama, ensure Ollama is installed and download the required model. Then, configure the Ollama model in the .env file.

### Note: Before using Ollama, install it on your system and ensure the required model is downloaded.

