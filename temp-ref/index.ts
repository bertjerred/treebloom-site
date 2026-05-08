import { Auth } from "@auth/core";
import { getAuthConfig, getSession } from "./auth";
import { renderLayout, StaticPages, dramasticPlasticHtml, renderLabTemplate, renderAdminDashboard } from "./ui";
import { renderLabPage } from "./lab";
import { generateSecretWord } from "./lib/beepers";

declare global {
  interface Request {
    userId?: string;
  }
}

function getRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export interface Env {
  muzoink_db: D1Database;
  muzoink_media: R2Bucket;
  AUTH_SECRET: string;
  AUTH_GOOGLE_ID: string;
  AUTH_GOOGLE_SECRET: string;
  ADMIN_PASSPHRASE: string;
}



export default {
  // Edge Event Handler for HTTP Traffic
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. THE BOUNCER
    if (url.pathname.startsWith("/auth")) {
      return await Auth(request, getAuthConfig(env));
    }

    // 2. THE FILE SERVER
    if (url.pathname.startsWith("/media/")) {
      const filename = url.pathname.replace("/media/", "");
      const mediaObject = await env.muzoink_media.get(filename);
      if (mediaObject === null) return new Response("Not Found", { status: 404 });

      const headers = new Headers();
      mediaObject.writeHttpMetadata(headers);
      headers.set("etag", mediaObject.httpEtag);
      return new Response(mediaObject.body, { headers });
    }

    // -------------------------------------------------------------
    // LAB API ROUTES & INTERCEPTOR
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/lab") || url.pathname.startsWith("/api/lab")) {
      const session = await getSession(request, env);
      if (!session || !session.user || !session.user.id) {
        if (url.pathname.startsWith("/api/")) {
          return new Response("401 Unauthorized", { status: 401 });
        } else {
          return Response.redirect(`${url.origin}/login`, 302);
        }
      }
      request.userId = session.user.id;
    }



    // POST /api/lab/beepers/create
    if (url.pathname === "/api/lab/beepers/create" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const name = body.name;
        if (!name) {
          return new Response("Missing name", { status: 400 });
        }

        const beeperId = crypto.randomUUID();
        const secretWord = generateSecretWord();
        const birthDate = Math.floor(Date.now() / 1000);

        await env.muzoink_db.prepare(
          "INSERT INTO Beepers (id, owner_id, name, secret_word, birth_date, vocabulary, allow_social, allow_faraway_social, times_visited, is_approved, is_released) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
        ).bind(beeperId, request.userId!, name, secretWord, birthDate, secretWord, 1, 0, 0, 0, 0).run();



        return new Response(JSON.stringify({ success: true, id: beeperId }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // GET /api/lab/beepers
    if (url.pathname === "/api/lab/beepers" && request.method === "GET") {
      try {
        const { results: beepers } = await env.muzoink_db.prepare(
          "SELECT * FROM Beepers WHERE owner_id =? AND is_released = 0 ORDER BY birth_date DESC"
        ).bind(request.userId!).all();

        const enrichedBeepers = await Promise.all(beepers.map(async (beeper: any) => {
          const { results: interactions } = await env.muzoink_db.prepare(
            "SELECT target_name, timestamp FROM Beeper_Interactions WHERE initiator_id = ? ORDER BY timestamp DESC LIMIT 3"
          ).bind(beeper.id).all();

          return {
            ...beeper,
            encounters: (interactions || []).map((i: any) => ({
              name: i.target_name,
              time: getRelativeTime(i.timestamp)
            }))
          };
        }));

        return new Response(JSON.stringify(enrichedBeepers), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }


    // Task 2: POST /api/lab/beepers/release (Soft Deletion Protocol)
    if (url.pathname === "/api/lab/beepers/release" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const beeperId = body.beeperId;
        if (!beeperId) return new Response("Missing beeperId", { status: 400 });

        await env.muzoink_db.prepare(
          "UPDATE Beepers SET is_released = 1 WHERE id =? AND owner_id =?"
        ).bind(beeperId, request.userId!).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // POST /api/lab/beepers/toggle-social
    if (url.pathname === "/api/lab/beepers/toggle-social" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const beeperId = body.beeperId;
        const allowSocial = body.allowSocial ? 1 : 0;
        if (!beeperId) return new Response("Missing beeperId", { status: 400 });

        await env.muzoink_db.prepare(
          "UPDATE Beepers SET allow_social = ? WHERE id = ? AND owner_id = ?"
        ).bind(allowSocial, beeperId, request.userId!).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // POST /api/lab/beepers/toggle-faraway
    if (url.pathname === "/api/lab/beepers/toggle-faraway" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const beeperId = body.beeperId;
        const allowFaraway = body.allowFaraway ? 1 : 0;
        if (!beeperId) return new Response("Missing beeperId", { status: 400 });

        await env.muzoink_db.prepare(
          "UPDATE Beepers SET allow_faraway_social = ? WHERE id = ? AND owner_id = ?"
        ).bind(allowFaraway, beeperId, request.userId!).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // POST /api/lab/beepers/approve (Hidden Admin Command)
    if (url.pathname === "/api/lab/beepers/approve" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const { beeperName, passphrase } = body;

        if (passphrase !== env.ADMIN_PASSPHRASE) {
          return new Response("Unauthorized: Invalid passphrase.", { status: 401 });
        }

        const result = await env.muzoink_db.prepare(
          "UPDATE Beepers SET is_approved = 1 WHERE name = ? COLLATE NOCASE"
        ).bind(beeperName).run();

        if (result.meta.changes === 0) {
          return new Response("Unit not found.", { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // 3. FETCH USER SESSION
    const isHtmlRoute = ["/", "/api/admin/dashboard", "/privacy", "/tos", "/apps", "/lab", "/apps/dramastic-plastic/privacy"].includes(url.pathname);
    let user = null;

    if (isHtmlRoute) {
      const sessionReq = new Request(new URL("/auth/session", request.url).toString(), { headers: request.headers });
      const sessionRes = await Auth(sessionReq, getAuthConfig(env));
      const sessionData = await sessionRes.json() as any;
      user = sessionData?.user;
    }

    // -------------------------------------------------------------
    // 4. SECURE ADMIN ZONE
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/api/admin")) {
      const sessionReq = new Request(new URL("/auth/session", request.url).toString(), { headers: request.headers });
      const sessionRes = await Auth(sessionReq, getAuthConfig(env));
      const sessionData = await sessionRes.json() as any;
      if (!sessionData?.user || sessionData.user.role !== "admin") return new Response("401 Unauthorized", { status: 401 });

      if (url.pathname === "/api/admin/dashboard") {
        const { results: episodes } = await env.muzoink_db.prepare("SELECT * FROM MuPods ORDER BY published_at DESC").all();
        const epList = episodes.map((ep: any) => `
          <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding: 15px 0;">
              <div style="display: flex; gap: 15px; align-items: center;">
                  ${ep.cover_url ? `<img src="${ep.cover_url}" style="width: 50px; height: 50px; border-radius: 50%;">` : ''}
                  <div>
                      <strong style="display: block;">${ep.title}</strong>
                      <span style="font-size: 0.85rem; color: #666;">${new Date(ep.published_at).toLocaleDateString()}</span>
                  </div>
              </div>
              <form action="/api/admin/delete" method="POST" onsubmit="return confirm('Permanently delete this transmission? This cannot be undone.');">
                  <input type="hidden" name="id" value="${ep.id}">
                  <button type="submit" style="background: #d63031; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Delete</button>
              </form>
          </li>
        `).join("");

        const { results: visitors } = await env.muzoink_db.prepare("SELECT * FROM users ORDER BY name ASC").all();
        const visitorList = visitors.map((visitor: any) => `
          <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding: 15px 0;">
              <div style="display: flex; gap: 15px; align-items: center;">
                  ${visitor.image ? `<img src="${visitor.image}" style="width: 40px; height: 40px; border-radius: 50%;">` : ''}
                  <div>
                      <strong style="display: block;">${visitor.name || 'Unknown User'}</strong>
                      <span style="font-size: 0.85rem; color: #666;">${visitor.email}</span>
                  </div>
              </div>
              ${visitor.email === 'charlesherbertjerred@gmail.com' ? `<span style="font-size: 0.85rem; font-weight: bold; color: var(--primary); padding-right: 10px;">Owner</span>` :
            `<form action="/api/admin/delete-user" method="POST" onsubmit="return confirm('Revoke lab access for this user?');">
                  <input type="hidden" name="id" value="${visitor.id}">
                  <button type="submit" style="background: #2b221d; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">Revoke Access</button>
              </form>`}
          </li>
        `).join("");

        const { results: moderatedBeepers } = await env.muzoink_db.prepare(`
            SELECT 
                b.id as beeper_id, 
                b.name as beeper_name, 
                b.is_released,
                b.is_approved,
                u.id as user_id, 
                u.name as owner_name, 
                u.email as owner_email
            FROM Beepers b
            JOIN users u ON b.owner_id = u.id
            ORDER BY b.id DESC
        `).all();

        const adminContent = renderAdminDashboard(epList, visitorList, (moderatedBeepers || []) as any[]);
        return new Response(renderLayout("Admin | muzoink", adminContent, user), {
          headers: { "Content-Type": "text/html" }
        });
      }

      if (url.pathname === "/api/admin/upload" && request.method === "POST") {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const audioFile = formData.get("mupod_file") as File;
        const coverFile = formData.get("cover_file") as File;
        
        // Advanced Metadata
        const episodeType = formData.get("episode_type") as string || "full";
        const season = formData.get("season") ? parseInt(formData.get("season") as string) : null;
        const episodeNumber = formData.get("episode_number") ? parseInt(formData.get("episode_number") as string) : null;
        const isExplicit = formData.get("is_explicit") === "1" ? 1 : 0;

        const safeAudioName = `${Date.now()}_audio_${audioFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        await env.muzoink_media.put(safeAudioName, audioFile.stream());

        const safeCoverName = `${Date.now()}_cover.png`;
        await env.muzoink_media.put(safeCoverName, coverFile.stream());

        await env.muzoink_db.prepare("INSERT INTO MuPods (title, description, media_url, cover_url, episode_type, season, episode_number, is_explicit) VALUES (?,?,?,?,?,?,?,?)")
          .bind(title, description, `/media/${safeAudioName}`, `/media/${safeCoverName}`, episodeType, season, episodeNumber, isExplicit).run();

        return Response.redirect(`${url.origin}/api/admin/dashboard`, 303);
      }

      if (url.pathname === "/api/admin/delete" && request.method === "POST") {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const episode: any = await env.muzoink_db.prepare("SELECT * FROM MuPods WHERE id =?").bind(id).first();
        if (episode) {
          if (episode.media_url) await env.muzoink_media.delete(episode.media_url.replace("/media/", ""));
          if (episode.cover_url) await env.muzoink_media.delete(episode.cover_url.replace("/media/", ""));
          await env.muzoink_db.prepare("DELETE FROM MuPods WHERE id =?").bind(id).run();
        }
        return Response.redirect(`${url.origin}/api/admin/dashboard`, 303);
      }

      if (url.pathname === "/api/admin/delete-user" && request.method === "POST") {
        const formData = await request.formData();
        const targetUserId = formData.get("id") as string;
        const targetUser: any = await env.muzoink_db.prepare("SELECT email FROM users WHERE id =?").bind(targetUserId).first();

        if (targetUser && targetUser.email !== "charlesherbertjerred@gmail.com") {
          await env.muzoink_db.prepare("DELETE FROM users WHERE id =?").bind(targetUserId).run();
        }
        return Response.redirect(`${url.origin}/api/admin/dashboard`, 303);
      }

      if (url.pathname === "/api/admin/delete-beeper" && request.method === "POST") {
        try {
          const body = await request.json() as any;
          await env.muzoink_db.prepare("DELETE FROM Beepers WHERE id = ?").bind(body.beeperId).run();
          return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        } catch (err: any) {
          return new Response(err.message, { status: 500 });
        }
      }

      if (url.pathname === "/api/admin/ban-user" && request.method === "POST") {
        try {
          const body = await request.json() as any;
          await env.muzoink_db.prepare("UPDATE Users SET role = 'banned' WHERE id = ?").bind(body.userId).run();
          return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        } catch (err: any) {
          return new Response(err.message, { status: 500 });
        }
      }

      if (url.pathname === "/api/admin/beepers/toggle-approval" && request.method === "POST") {
          try {
            const body = await request.json() as any;
            const { beeperId, isApproved } = body;
            await env.muzoink_db.prepare("UPDATE Beepers SET is_approved = ? WHERE id = ?")
              .bind(isApproved ? 1 : 0, beeperId).run();
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
          } catch (err: any) {
            return new Response(err.message, { status: 500 });
          }
      }
    }

    // -------------------------------------------------------------
    // 5. THE RSS BROADCASTER (Minutiae Feed)
    // -------------------------------------------------------------
    if (url.pathname === "/feed.xml") {
      const { results } = await env.muzoink_db.prepare("SELECT * FROM MuPods ORDER BY published_at DESC LIMIT 50").all();
      let itemsXml = results.map((item: any) => `
          <item>
              <title><![CDATA[${item.title}]]></title>
              <description><![CDATA[${item.description}]]></description>
              <enclosure url="${url.origin}${item.media_url}" type="audio/mpeg" length="0" />
              <guid isPermaLink="false">${url.origin}${item.media_url}</guid>
              ${item.cover_url ? `<itunes:image href="${url.origin}${item.cover_url}" />` : ''}
              <itunes:author>Bert Jerred Music Publishing</itunes:author>
              <itunes:summary><![CDATA[${item.description}]]></itunes:summary>
              <itunes:explicit>${item.is_explicit ? 'yes' : 'no'}</itunes:explicit>
              <itunes:episodeType>${item.episode_type || 'full'}</itunes:episodeType>
              ${item.season ? `<itunes:season>${item.season}</itunes:season>` : ''}
              ${item.episode_number ? `<itunes:episode>${item.episode_number}</itunes:episode>` : ''}
              <pubDate>${new Date(item.published_at).toUTCString()}</pubDate>
          </item>`).join("");

      const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
              <channel>
                  <title>Minutiae</title>
                  <link>${url.origin}</link>
                  <language>en-us</language>
                  <itunes:author>Bert Jerred</itunes:author>
                  <itunes:owner>
                      <itunes:name>Bert Jerred</itunes:name>
                      <itunes:email>charlesherbertjerred@gmail.com</itunes:email>
                  </itunes:owner>
                  <itunes:type>episodic</itunes:type>
                  <itunes:category text="Music" />
                  <itunes:image href="${url.origin}/media/muzoink-logo-transparent.png" />
                  <description>Under-one-minute TTS-narrated audio updates from Muzoink.</description>
                  <itunes:summary>Under-one-minute TTS-narrated audio updates from Muzoink.</itunes:summary>
                  ${itemsXml}
              </channel>
          </rss>`;
      return new Response(feedXml, {
        headers: { "Content-Type": "application/rss+xml" }
      });
    }

    // 6. THE LOBBY
    if (url.pathname === "/") {
      const { results } = await env.muzoink_db.prepare("SELECT * FROM MuPods ORDER BY published_at DESC LIMIT 5").all();
      const minutiaeHtml = results.map((item: any) => `
          <div class="mu-card" style="display: flex; gap: 20px; align-items: flex-start;">
              ${item.cover_url ? `<img src="${item.cover_url}" alt="Cover Art" style="width: 100px; height: 100px; border-radius: 50%; border: 2px solid var(--primary); flex-shrink: 0;">` : ''}
              <div style="flex-grow: 1;">
                  <h3 style="margin-top: 0;">${item.title}</h3>
                  <p>${item.description}</p>
                  <audio controls src="${item.media_url}" style="width: 100%; box-sizing: border-box;"></audio>
              </div>
          </div>`).join("");

      const mainContent = `
          <section style="margin-bottom: 50px;">
              <h2 style="letter-spacing: -1px; margin: 0 0 15px 0;">About</h2>
              <p>Muzoink is the publishing playground of <a href="https://www.linkedin.com/in/bertjerred/" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-weight: bold;">Bert Jerred</a>. It includes mobile and desktop apps, open- and closed-source projects, audio plugins, and educational software.</p>
              
              <h3 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; letter-spacing: -0.5px;">Software</h3>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px;">
                  <li><strong><a href="https://chimeball.com/" target="_blank" style="color: var(--primary); text-decoration: none;">Chime Ball for Android</a></strong>: Simple, physics-based sequencer for kids</li>
                  <li><strong><a href="/apps/dramastic-plastic" style="color: var(--primary); text-decoration: none;">Dramastic Plastic for Windows</a></strong>: 2-oscillator software synth</li>
                  <li><strong><a href="https://github.com/bertjerred/grow/releases/tag/v0.1.0" target="_blank" style="color: var(--primary); text-decoration: none;">Grow (AU, VST/3)</a></strong>: open-source virtual instrument</li>
                  <li><strong><a href="https://www.motivicmidi.com/" target="_blank" style="color: var(--primary); text-decoration: none;">Motivic MIDI for Android</a></strong>: chord progression generator with MIDI output</li>
                  <li><strong><a href="https://treebloom.org/apps/rubric-maker/" target="_blank" style="color: var(--primary); text-decoration: none;">Rubric Maker for Windows</a></strong>: curriculum management tool</li>
                  <li><strong><a href="https://bertjerred.com/apps/you-are-here/" target="_blank" style="color: var(--primary); text-decoration: none;">You Are Here for Android</a></strong>: GNSS/GPS discovery tool</li>
              </ul>

              <h3 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; letter-spacing: -0.5px;">Media</h3>
              <ul style="list-style: none; padding: 0;">
                  <li><strong><a href="https://bertjerred.com/bjmp/" target="_blank" style="color: var(--primary); text-decoration: none;">Bert Jerred Music Publishing</a></strong></li>
              </ul>
          </section>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
              <div>
                  <h2 style="letter-spacing: -1px; margin: 0;">Minutiae</h2>
                  <p style="margin: 5px 0 0 0; color: #555; font-style: italic;">Under-one-minute TTS-narrated audio updates from Muzoink.</p>
              </div>
              <a href="/feed.xml" target="_blank" title="Subscribe via RSS" style="color: var(--text); text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
              </a>
          </div>
          ${minutiaeHtml || "<p>Audio forthcoming.</p>"}
      `;
      return new Response(renderLayout("muzoink.com", mainContent, user), {
        headers: { "Content-Type": "text/html" }
      });
    }

    // -------------------------------------------------------------
    // 7. THE SECURE LAB
    // -------------------------------------------------------------
    if (url.pathname === "/lab") {
      if (!user) {
        return Response.redirect(`${url.origin}/auth/signin`, 302);
      }
      
      // 1. Fetch user's Beepers from D1
      const { results } = await env.muzoink_db.prepare(
        "SELECT * FROM Beepers WHERE owner_id = ? AND is_released = 0 ORDER BY birth_date DESC"
      ).bind(request.userId!).all();

      // 2. Generate the interior terminal widget
      const terminalHtml = renderLabTemplate(results);

      // 3. Wrap it in the global Muzoink shell
      const finalHtml = renderLayout("Muzoink Lab | muzoink", terminalHtml, user);

      return new Response(finalHtml, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // 8. LEGAL & STATIC PAGES
    if (url.pathname === "/privacy") {
      return new Response(renderLayout("Privacy Policy | muzoink", StaticPages.privacy, user), { headers: { "Content-Type": "text/html" } });
    }
    if (url.pathname === "/tos") {
      return new Response(renderLayout("Terms of Service | muzoink", StaticPages.tos, user), { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/apps/dramastic-plastic") {
      return new Response(renderLayout("Dramastic Plastic | muzoink", dramasticPlasticHtml, user), { headers: { "Content-Type": "text/html" } });
    }
    if (url.pathname === "/apps/dramastic-plastic/privacy") {
      return new Response(renderLayout("Privacy Policy | Dramastic Plastic", StaticPages.dramasticPlasticPrivacy, user), { headers: { "Content-Type": "text/html" } });
    }

    return new Response("404: The void stares back.", { status: 404 });
  },

  // Task 3: Scheduled Event Dispatcher (Autonomous Ecosystem)
  async scheduled(controller: any, env: Env, ctx: ExecutionContext) {
    const now = Math.floor(Date.now() / 1000);
    const cooldownPeriod = 86400; // 24 hours

    // 1. AUTONOMOUS SOCIALIZATION LOGIC
    // Fetch all active beepers that are opting into social interactions
    const { results: activeBeepers } = await env.muzoink_db.prepare(
      "SELECT * FROM Beepers WHERE is_released = 0 AND allow_social = 1"
    ).all();

    for (const initiator of activeBeepers as any[]) {
      // Find an eligible partner B
      // Rule: Nearby (same owner) OR Faraway (different owner AND both allow_faraway_social)
      // Must not be the same beeper, and must respect 24h cooldown.
      const partner: any = await env.muzoink_db.prepare(`
        SELECT * FROM Beepers 
        WHERE id != ? 
        AND is_released = 0 
        AND allow_social = 1
        AND (
          owner_id = ? 
          OR (owner_id != ? AND allow_faraway_social = 1 AND ? = 1 AND is_approved = 1 AND ? = 1)
        )
        AND id NOT IN (
          SELECT target_id FROM Beeper_Interactions 
          WHERE initiator_id = ? AND timestamp > ?
        )
        ORDER BY RANDOM() LIMIT 1
      `).bind(
        initiator.id,
        initiator.owner_id,
        initiator.owner_id,
        initiator.allow_faraway_social,
        initiator.is_approved,
        initiator.id,
        now - cooldownPeriod
      ).first();

      if (partner) {
        // Vocabulary Exchange
        let initiatorVocab: string[] = [];
        let partnerVocab: string[] = [];
        try {
          initiatorVocab = JSON.parse(initiator.vocabulary);
          partnerVocab = JSON.parse(partner.vocabulary);
        } catch (e) { continue; }

        if (partnerVocab.length > 0) {
          const newSyllable = partnerVocab[Math.floor(Math.random() * partnerVocab.length)];
          
          // Enforce 8-syllable limit, preserving index 0
          if (initiatorVocab.length >= 8) {
            initiatorVocab.splice(1, 1);
          }
          initiatorVocab.push(newSyllable);

          // Update Initiator
          await env.muzoink_db.prepare(
            "UPDATE Beepers SET vocabulary = ?, last_interaction = ? WHERE id = ?"
          ).bind(JSON.stringify(initiatorVocab), now, initiator.id).run();

          // Update Partner (telemetry)
          await env.muzoink_db.prepare(
            "UPDATE Beepers SET times_visited = COALESCE(times_visited, 0) + 1, last_interaction = ? WHERE id = ?"
          ).bind(now, partner.id).run();

          // Log Interaction
          await env.muzoink_db.prepare(
            "INSERT INTO Beeper_Interactions (initiator_id, target_id, target_name, timestamp) VALUES (?, ?, ?, ?)"
          ).bind(initiator.id, partner.id, partner.name, now).run();
        }
      }
    }


  }
};