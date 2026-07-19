# 1. Use an official lightweight Node image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy your package files and install dependencies
# We do this first so Docker can cache the installation (faster builds!)
COPY package*.json ./
RUN npm install

# 4. Copy all your application code into the container
COPY . .

# 5. Tell the container which port your app uses (change 3000 to your server port)
EXPOSE 3000

# 6. The final command to start your app
CMD ["node", "index.js"] 
# (Make sure "index.js" matches your main server file name) 