-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onwerId" TEXT,
    CONSTRAINT "pools_onwerId_fkey" FOREIGN KEY ("onwerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL,
    "first_team_country_code" TEXT NOT NULL,
    "second_team_country_code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "guesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_team_points" INTEGER NOT NULL,
    "second_team_points" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_id" TEXT NOT NULL,
    "particapant_id" TEXT NOT NULL,
    CONSTRAINT "guesses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "guesses_particapant_id_fkey" FOREIGN KEY ("particapant_id") REFERENCES "particapants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "particapants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    CONSTRAINT "particapants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "particapants_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pools_code_key" ON "pools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "particapants_userId_poolId_key" ON "particapants"("userId", "poolId");
