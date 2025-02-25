import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createTableColumnsEnum } from "./util";

export const users = sqliteTable("users", {
  userId: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  role: text("role").default("user"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});


export const session = sqliteTable("session", {
  sessionId: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
});

export const user_roles = sqliteTable("user_roles", {
  user_id: integer("user_id")
    .notNull()
    .references(() => users.userId),
  role: text("role").notNull(),
});

export const account = sqliteTable("account", {
  accountId: text("id").primaryKey(),
  providerAccountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  verificationId: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const organization = sqliteTable("organization", {
  organizationId: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  metadata: text("metadata"),
});

export const member = sqliteTable("member", {
  memberId: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.organizationId),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId),
  role: text("role").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const invitation = sqliteTable("invitation", {
  invitationId: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.organizationId),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.userId),
});

export const leagues = sqliteTable("leagues", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
});

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey(),
  leagueId: integer("league_id")
    .notNull()
    .references(() => leagues.id),
  name: text("name").notNull(),
  captainId: integer("captain_id"),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey(),
  leagueId: integer("league_id")
    .notNull()
    .references(() => leagues.id),
  homeTeamId: integer("home_team_id")
    .notNull()
    .references(() => teams.id),
  awayTeamId: integer("away_team_id")
    .notNull()
    .references(() => teams.id),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  location: text("location"),
});

export const referees = sqliteTable("referees", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
});

export const playerStats = sqliteTable("player_stats", {
  id: integer("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  blocks: integer("blocks").notNull().default(0),
  turnovers: integer("turnovers").notNull().default(0),
});

export const teamStats = sqliteTable("team_stats", {
  id: integer("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id),
  score: integer("score").notNull(),
  spiritScore: real("spirit_score"),
});

export type OrganizationInsert = typeof organization.$inferInsert;
export type OrganizationUpdate = Partial<typeof organization.$inferSelect>;
export type OrganizationSelect = typeof organization.$inferSelect;
export const OrganizationColumns = createTableColumnsEnum(organization);

export type UserInsert = typeof users.$inferInsert;
export type UserUpdate = Partial<typeof users.$inferSelect>;
export type UserSelect = typeof users.$inferSelect;
export const UserColumns = createTableColumnsEnum(users);

export type LeagueInsert = typeof leagues.$inferInsert;
export type LeagueUpdate = Partial<typeof leagues.$inferSelect>;
export type League = typeof leagues.$inferSelect;

export type TeamInsert = typeof teams.$inferInsert;
export type TeamUpdate = Partial<typeof teams.$inferSelect>;
export type Team = typeof teams.$inferSelect;

export type PlayerInsert = typeof players.$inferInsert;
export type PlayerUpdate = Partial<typeof players.$inferSelect>;
export type Player = typeof players.$inferSelect;

export type GameInsert = typeof games.$inferInsert;
export type GameUpdate = Partial<typeof games.$inferSelect>;
export type Game = typeof games.$inferSelect;

export type RefereeInsert = typeof referees.$inferInsert;
export type RefereeUpdate = Partial<typeof referees.$inferSelect>;
export type Referee = typeof referees.$inferSelect;

export type PlayerStatInsert = typeof playerStats.$inferInsert;
export type PlayerStatUpdate = Partial<typeof playerStats.$inferSelect>;
export type PlayerStat = typeof playerStats.$inferSelect;

export type TeamStatInsert = typeof teamStats.$inferInsert;
export type TeamStatUpdate = Partial<typeof teamStats.$inferSelect>;
export type TeamStat = typeof teamStats.$inferSelect;
