/*
  Warnings:

  - A unique constraint covering the columns `[particapant_id,game_id]` on the table `guesses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "guesses_particapant_id_game_id_key" ON "guesses"("particapant_id", "game_id");
