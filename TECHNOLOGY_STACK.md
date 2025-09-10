# CivicLink Application: Technology Stack

This document outlines the core technologies and frameworks used to build the CivicLink application.

## 1. Core Framework: Next.js & React

-   **Next.js**: The primary web framework, utilizing the **App Router** for modern, server-centric architecture. This enables features like file-based routing, Server Components, and API-less data mutations.
-   **React**: The fundamental UI library for building the user interface with a component-based model.
-   **Server Components**: Most components are rendered on the server to improve initial page load times and allow for secure, direct data access.
-   **Client Components**: Interactive parts of the UI are explicitly marked as Client Components (`'use client'`) to run in the browser.

## 2. UI & Styling

-   **ShadCN/UI**: A collection of beautifully designed, accessible, and highly customizable UI components. Unlike traditional component libraries, ShadCN components are added directly to the codebase, allowing for full control.
-   **Tailwind CSS**: A utility-first CSS framework used for rapid and consistent styling. It allows us to build complex designs without writing custom CSS.
-   **Lucide React**: Provides the clean, lightweight, and consistent icon set used throughout the application.

## 3. Language

-   **TypeScript**: The application is written in TypeScript, a superset of JavaScript that adds static typing. This helps catch errors during development, improves code quality, and enables better developer tooling.

## 4. Artificial Intelligence (AI)

-   **Genkit**: An open-source framework from Google for building AI-powered features. It orchestrates calls to large language models (LLMs) like Gemini.
-   **AI Features Implemented**:
    -   **Image Categorization**: When a user uploads an image for a report, Genkit uses a multi-modal AI model to analyze the image and suggest the most relevant issue category.
    -   **Priority Prediction**: Genkit analyzes the title, description, and category of a new report to predict its urgency and assign a priority level (Low, Medium, or High).

## 5. Data Handling & Backend

-   **Next.js Server Actions**: Used to handle form submissions and data mutations (e.g., creating an issue, signing up a user). This allows the client to call secure server-side functions directly, without the need to manually create API endpoints.
-   **File-Based Data Storage**: For this prototype, all application data (issues, users) is stored in simple `.json` files within the `src/data/` directory. This serves as a lightweight, server-side "database."
