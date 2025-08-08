using MediaPlayer.API.Data;
using MediaPlayer.API.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediaPlayer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlaylistController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/playlist
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Playlist>>> GetPlaylists()
        {
            return await _context.Playlists
                .Include(p => p.PlaylistMedias)
                .ThenInclude(pm => pm.Media)
                .ToListAsync();
        }

        // POST: api/playlist
        [HttpPost]
        public async Task<ActionResult<Playlist>> CreatePlaylist([FromBody] Playlist playlist)
        {
            if (playlist.Id == Guid.Empty)
                playlist.Id = Guid.NewGuid();

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPlaylists), new { id = playlist.Id }, playlist);
        }

        // POST: api/playlist/{id}/add-media?mediaId=guid
        [HttpPost("{id}/add-media")]
        public async Task<IActionResult> AddMediaToPlaylist(Guid id, [FromQuery] Guid mediaId)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            var media = await _context.Medias.FindAsync(mediaId);

            if (playlist == null || media == null)
                return NotFound();

            var exists = await _context.PlaylistMedias.AnyAsync(pm =>
                pm.PlaylistId == id && pm.MediaId == mediaId);

            if (exists)
                return BadRequest("Mídia já está na playlist.");

            _context.PlaylistMedias.Add(new PlaylistMedia
            {
                PlaylistId = id,
                MediaId = mediaId,
                Ordem = 0
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/playlist/{id}/remove-media?mediaId=guid
        [HttpPost("{id}/remove-media")]
        public async Task<IActionResult> RemoveMediaFromPlaylist(Guid id, [FromQuery] Guid mediaId)
        {
            var item = await _context.PlaylistMedias
                .FirstOrDefaultAsync(pm => pm.PlaylistId == id && pm.MediaId == mediaId);

            if (item == null)
                return NotFound();

            _context.PlaylistMedias.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
