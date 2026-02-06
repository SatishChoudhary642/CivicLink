# Nextn - Issue Tracking Web Application

This is a web application for reporting and tracking local issues. Users can create accounts, report issues with details and location, view issues on a map, and see a feed of all reported issues. An admin dashboard is available for managing reported issues.

## Features

*   **User Authentication:** Users can sign up and log in to their accounts.
*   **Issue Reporting:** Users can report new issues, providing a title, description, and location.
*   **Interactive Map:** View all reported issues on an interactive map.
*   **Issue Feed:** A real-time feed of all reported issues.
*   **Admin Dashboard:** A dashboard for administrators to view and manage all reported issues.
*   **AI-Powered Features:** The application uses Genkit for AI-powered features.

## Technologies Used

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) - React framework for building user interfaces.
    *   [React](https://reactjs.org/) - JavaScript library for building user interfaces.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
    *   [Leaflet](https://leafletjs.com/) - An open-source JavaScript library for interactive maps.
*   **Backend:**
    *   [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
    *   [Firebase](https://firebase.google.com/) - for authentication and database.
*   **AI:**
    *   [Genkit](https://firebase.google.com/docs/genkit) - for integrating AI-powered features.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 20 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/nextn.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd nextn
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the code.
*   `npm run typecheck`: Checks for TypeScript errors.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with watch mode.

## Deployment

This project is configured for deployment to Google App Engine using the `apphosting.yaml` file.
