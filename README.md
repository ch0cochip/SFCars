# COMP3900 Project

This project serves as a demonstration of deploying a full-stack application using Docker. The frontend is built using Nextjs and the backend is built with Python.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### 📋 Prerequisites

- Docker: You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).

### 🖥️ Installing

1. **Clone the repository**
   ```
   git clone git@github.com:unsw-cse-comp3900-9900-23T2/capstone-project-3900w11bsegmentationfault.git
   ```
2. **Navigate to the project directory**
   ```
   cd capstone-project-3900w11bsegmentationfault
   ```
3. **Build the Docker images and start the containers**
   ```
   docker compose up --build
   ```
   Note: The `--build` flag ensures that Docker builds the images before starting the containers.

### 🔗 Accessing the Applications

After you start the Docker containers, you can access the applications at:

- **Frontend**: Open your web browser and navigate to `http://localhost:3000`.
- **Backend**: Open your web browser and navigate to `http://localhost:5000`.

## 🛠️ Development

The project uses Docker Compose volumes to enable hot reloading. Any changes you make to the application code on your local machine will be reflected in the Docker containers.

## 🛑 Stopping the Applications

To stop the Docker containers, press `CTRL+C` in the terminal where you ran `docker-compose up`. If that doesn't work, you can stop the containers with:

```bash
docker compose down
```

## ⚙️ Built With

- [Next.js](https://nextjs.org/) - The runtime used for the frontend application.
- [Python](https://www.python.org) - The language used for the backend application.

## 🖊️ Authors

- **Anthony Do** - _Backend Developer_
- **Austin Lai** - _Backend Developer_
- **Careen Christina Hakim** - _Frontend Developer_
- **Wenbin Gao** - _Frontend Developer_
- **Mridul Singal** - _Frontend Developer, Scrum Master_

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
