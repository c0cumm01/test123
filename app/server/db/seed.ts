import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import { db } from "./connection";
import {
  GameInsert,
  games,
  LeagueInsert,
  leagues,
  PlayerInsert,
  players,
  PlayerStatInsert,
  playerStats,
  RefereeInsert,
  referees,
  TeamInsert,
  teams,
  TeamStatInsert,
  teamStats,
} from "./schema";

const seedData = async () => {
  // Leagues
  const leagueInserts: LeagueInsert[] = [
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      startDate: faker.date.recent(),
      endDate: faker.date.future(),
    },
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      startDate: faker.date.recent(),
      endDate: faker.date.future(),
    },
  ];

  const leagueRecords = await db
    .insert(leagues)
    .values(leagueInserts)
    .returning();

  // Teams
  const teamInserts: TeamInsert[] = [];
  for (const league of leagueRecords) {
    for (let i = 0; i < 4; i++) {
      teamInserts.push({
        leagueId: league.id,
        name: faker.company.name(),
      });
    }
  }

  const teamRecords = await db.insert(teams).values(teamInserts).returning();

  // Update teams with captains
  const teamUpdates = teamRecords.map((team, index) => ({
    id: team.id,
    captainId:
      index < teamRecords.length / 2 ? teamRecords[index * 2].id : null,
  }));

  for await (const team of teamUpdates) {
    await db.update(teams).set(team).where(eq(teams.id, team.id));
  }

  // Players
  const playerInserts: PlayerInsert[] = [];
  for (const team of teamRecords) {
    for (let i = 0; i < 10; i++) {
      playerInserts.push({
        teamId: team.id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
      });
    }
  }

  const playerRecords = await db
    .insert(players)
    .values(playerInserts)
    .returning();

  // Games
  const gameInserts: GameInsert[] = [];
  for (const league of leagueRecords) {
    const leagueTeams = teamRecords.filter(
      (team) => team.leagueId === league.id,
    );
    for (let i = 0; i < 10; i++) {
      const homeTeam =
        leagueTeams[Math.floor(Math.random() * leagueTeams.length)];
      const awayTeam = leagueTeams.find((team) => team.id !== homeTeam.id);
      if (awayTeam) {
        gameInserts.push({
          leagueId: league.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          startTime: faker.date.soon(),
          location: faker.location.city(),
        });
      }
    }
  }

  const gameRecords = await db.insert(games).values(gameInserts).returning();

  // Referees
  const refereeInserts: RefereeInsert[] = [];
  for (let i = 0; i < 10; i++) {
    refereeInserts.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
    });
  }

  await db.insert(referees).values(refereeInserts);

  // Player Stats
  const playerStatInserts: PlayerStatInsert[] = [];
  for (const game of gameRecords) {
    const gameTeams = [game.homeTeamId, game.awayTeamId];
    for (const teamId of gameTeams) {
      const teamPlayers = playerRecords.filter(
        (player) => player.teamId === teamId,
      );
      for (const player of teamPlayers) {
        playerStatInserts.push({
          playerId: player.id,
          gameId: game.id,
          goals: faker.number.int({ max: 5 }),
          assists: faker.number.int({ max: 5 }),
          blocks: faker.number.int({ max: 5 }),
          turnovers: faker.number.int({ max: 5 }),
        });
      }
    }
  }

  await db.insert(playerStats).values(playerStatInserts);

  // Team Stats
  const teamStatInserts: TeamStatInsert[] = [];
  for (const game of gameRecords) {
    const gameTeams = [game.homeTeamId, game.awayTeamId];
    for (const teamId of gameTeams) {
      teamStatInserts.push({
        teamId,
        gameId: game.id,
        score: faker.number.int({ min: 0, max: 20 }),
        spiritScore: faker.number.float({ min: 0, max: 5 }),
      });
    }
  }

  await db.insert(teamStats).values(teamStatInserts);
  console.log("Seed data generated successfully.");
};

await seedData();
