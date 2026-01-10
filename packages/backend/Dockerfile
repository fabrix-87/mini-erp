FROM oven/bun:1

WORKDIR /app

# Copia i file di dipendenze
COPY package.json bun.lockb* ./

# Installa le dipendenze
RUN bun install

# Copia il resto del codice
COPY . .

EXPOSE 4000

# Il comando di default (può essere sovrascritto nel docker-compose)
CMD ["bun", "run", "dev"]
