import { db } from "./db/index";

// Combine users + user_profiles
export async function getFullUserWithProfile(userId: string) {
  const result = await db.query(
    `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.name,
      u.bio,
      u.image,
      u.last_login,
      u.timezone,
      u.locale,
      up.display_name,
      up.headline,
      up.location,
      up.company,
      up.website,
      up.twitter_username,
      up.github_username,
      up.linkedin_url,
      up.youtube_channel,
      up.skills,
      up.expertise_levels,
      up.achievements,
      up.portfolio_urls,
      up.social_links,
      up.learning_goals,
      up.preferred_topics,
      up.availability_status
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.id = $1
    LIMIT 1;
  `,
    [userId]
  );

  return result.rows[0] ?? null;
}

// Create profile
export async function createUserProfile(userId: string, data: any) {
  const result = await db.query(
    `
    INSERT INTO user_profiles (
      user_id, display_name, headline, location, company, website,
      twitter_username, github_username, linkedin_url, youtube_channel,
      skills, expertise_levels, achievements, portfolio_urls,
      social_links, learning_goals, preferred_topics, availability_status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14,
      $15, $16, $17, $18
    )
    RETURNING *;
  `,
    [
      userId,
      data.display_name,
      data.headline,
      data.location,
      data.company,
      data.website,
      data.twitter_username,
      data.github_username,
      data.linkedin_url,
      data.youtube_channel,
      data.skills || [],
      data.expertise_levels || {},
      data.achievements || {},
      data.portfolio_urls || [],
      data.social_links || {},
      data.learning_goals || [],
      data.preferred_topics || [],
      data.availability_status || "active",
    ]
  );

  return result.rows[0];
}

// Update profile
export async function updateUserProfile(userId: string, data: any) {
  const result = await db.query(
    `
    UPDATE user_profiles
    SET 
      display_name = COALESCE($2, display_name),
      headline = COALESCE($3, headline),
      location = COALESCE($4, location),
      company = COALESCE($5, company),
      website = COALESCE($6, website),
      twitter_username = COALESCE($7, twitter_username),
      github_username = COALESCE($8, github_username),
      linkedin_url = COALESCE($9, linkedin_url),
      youtube_channel = COALESCE($10, youtube_channel),
      skills = COALESCE($11, skills),
      expertise_levels = COALESCE($12, expertise_levels),
      achievements = COALESCE($13, achievements),
      portfolio_urls = COALESCE($14, portfolio_urls),
      social_links = COALESCE($15, social_links),
      learning_goals = COALESCE($16, learning_goals),
      preferred_topics = COALESCE($17, preferred_topics),
      availability_status = COALESCE($18, availability_status),
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
  `,
    [
      userId,
      data.display_name,
      data.headline,
      data.location,
      data.company,
      data.website,
      data.twitter_username,
      data.github_username,
      data.linkedin_url,
      data.youtube_channel,
      data.skills,
      data.expertise_levels,
      data.achievements,
      data.portfolio_urls,
      data.social_links,
      data.learning_goals,
      data.preferred_topics,
      data.availability_status,
    ]
  );

  return result.rows[0];
}

// Delete profile
export async function deleteUserProfile(userId: string) {
  await db.query(
    `DELETE FROM user_profiles WHERE user_id = $1`,
    [userId]
  );

  return { success: true };
}

// List all profiles
export async function listAllProfiles() {
  const result = await db.query(`
    SELECT 
      u.id,
      u.username,
      u.email,
      up.display_name,
      up.headline,
      up.skills,
      up.availability_status
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    ORDER BY u.created_at DESC;
  `);

  return result.rows;
}

// Simple search by skills / name
export async function searchProfiles(query: string) {
  const result = await db.query(
    `
    SELECT u.id, u.username, up.display_name, up.skills
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE 
      u.username ILIKE $1 OR
      up.display_name ILIKE $1 OR
      $1 = ANY(up.skills)
    LIMIT 20;
  `,
    [`%${query}%`]
  );

  return result.rows;
}
