# BLOGIFY

This is a blog application built using Node.js, Express, and MongoDB. It allows users to perform all basic CRUD operations on blog posts, implements authentication and authorization using JWT tokens.

# Backend Blog API Documentation

This document provides information on the Backend Blog API. The API allows users to perform various actions such as user registration, login, logout, and more.

## Table of Contents

- [Registration](#registration)
- [Login](#login)
- [Logout](#logout)
- [Refresh Access Token](#refresh-access-token)
- [Change Password](#change-password)
- [Get Current User](#get-current-user)
- [Update User Details](#update-user-details)
- [Update Profile Picture](#update-profile-picture)
- [Get Author Profile](#get-author-profile)
- [Delete User](#delete-user)

## Registration

**Endpoint:** `POST /api/users/register`

Register a new user account.

- **Request:**

  ```json
  {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword",
    "profilePicture": [file]
  }
- **Response:**

  ```json
  {
  "status": 200,
  "data": {
    "user": {
      "username": "newuser",
      "email": "newuser@example.com",
      "profilePicture": "https://cloudinary.com/image_path",
      // Additional user details
    },
    "accessToken": "your_access_token",
    "refreshToken": "your_refresh_token"
  },
  "message": "User created successfully"
  }

## Login
  
**Endpoint:** `POST /api/users/login`

Login an existing user.

- **Request:**

  ```json
   {
      "email": "user@example.com",
      "password": "userpassword"
   }

- **Response:**

  ```json
  {
  "status": 200,
  "data": {
    "user": {
      // User details excluding sensitive information
    },
    "accessToken": "your_access_token",
    "refreshToken": "your_refresh_token"
  },
  "message": "User logged in successfully"
  }

##Delete User

**Endpoint:** DELETE /api/users/delete-user

Delete the user account.

- **Request:**

  ```json
      {
        "email": "user@example.com",
        "username": "existinguser",
        "password": "userpassword"
      }

- **Response:**

   ```json
   {
  "status": 200,
  "data": {},
  "message": "User has been deleted"
    }


## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blog-application.git
