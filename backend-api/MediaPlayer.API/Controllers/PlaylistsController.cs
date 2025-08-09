using MediaPlayer.API.Data;
using MediaPlayer.API.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediaPlayer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // => /api/Playlists
    public class PlaylistsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PlaylistsController(AppDbContext context) => _context = context;

        // DTOs usados pelos endpoints
        public record PlaylistCreateDto(string Nome, string? Descricao, bool ExibirNoPlayer);
        public record PlaylistUpdateDto(string Nome, string? Descricao, bool ExibirNoPlayer);
        public record UpdateItemsDto(Guid[] MediaIds);

        // GET: /api/Playlists
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPlaylists()
        {
            var data = await _context.Playlists
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Descricao,
                    p.ExibirNoPlayer,
                    TotalItens = p.PlaylistMedias.Count
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: /api/Playlists/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<object>> GetById(Guid id)
        {
            var p = await _context.Playlists
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.Nome,
                    x.Descricao,
                    x.ExibirNoPlayer,
                    TotalItens = x.PlaylistMedias.Count
                })
                .FirstOrDefaultAsync();

            return p is null ? NotFound() : Ok(p);
        }

        // POST: /api/Playlists
        [HttpPost]
        public async Task<ActionResult<object>> CreatePlaylist([FromBody] PlaylistCreateDto dto)
        {
            var playlist = new Playlist
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                ExibirNoPlayer = dto.ExibirNoPlayer
            };

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = playlist.Id }, new
            {
                playlist.Id,
                playlist.Nome,
                playlist.Descricao,
                playlist.ExibirNoPlayer,
                TotalItens = 0
            });
        }

        // PUT: /api/Playlists/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] PlaylistUpdateDto dto)
        {
            var p = await _context.Playlists.FindAsync(id);
            if (p is null) return NotFound();

            p.Nome = dto.Nome;
            p.Descricao = dto.Descricao;
            p.ExibirNoPlayer = dto.ExibirNoPlayer;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/Playlists/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePlaylist(Guid id)
        {
            var p = await _context.Playlists.FindAsync(id);
            if (p is null) return NotFound();

            _context.Playlists.Remove(p); // vai remover relacionamentos por FK composta
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Itens da playlist -----------------------------

        // GET: /api/Playlists/{id}/items
        [HttpGet("{id:guid}/items")]
        public async Task<ActionResult<IEnumerable<object>>> GetItems(Guid id)
        {
            var exists = await _context.Playlists.AnyAsync(p => p.Id == id);
            if (!exists) return NotFound();

            var items = await _context.PlaylistMedias
                .Where(i => i.PlaylistId == id)
                .OrderBy(i => i.Ordem)
                .Select(i => new { mediaId = i.MediaId, ordem = i.Ordem })
                .ToListAsync();

            return Ok(items);
        }

        // PUT: /api/Playlists/{id}/items  body: { mediaIds: Guid[] }
        [HttpPut("{id:guid}/items")]
        public async Task<IActionResult> UpdateItems(Guid id, [FromBody] UpdateItemsDto dto)
        {
            var playlist = await _context.Playlists
                .Include(p => p.PlaylistMedias)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (playlist is null) return NotFound();

            // remove vínculos atuais
            _context.PlaylistMedias.RemoveRange(playlist.PlaylistMedias);
            await _context.SaveChangesAsync();

            // recria na ordem enviada
            var toAdd = dto.MediaIds.Select((mid, idx) => new PlaylistMedia
            {
                PlaylistId = id,
                MediaId = mid,
                Ordem = idx
            });

            await _context.PlaylistMedias.AddRangeAsync(toAdd);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // (OPCIONAIS) Endpoints que você já tinha, com {id:guid} explícito:

        // POST: /api/Playlists/{id}/add-media?mediaId=guid
        [HttpPost("{id:guid}/add-media")]
        public async Task<IActionResult> AddMediaToPlaylist(Guid id, [FromQuery] Guid mediaId)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            var media = await _context.Medias.FindAsync(mediaId);
            if (playlist == null || media == null) return NotFound();

            var exists = await _context.PlaylistMedias.AnyAsync(pm => pm.PlaylistId == id && pm.MediaId == mediaId);
            if (exists) return BadRequest("Mídia já está na playlist.");

            _context.PlaylistMedias.Add(new PlaylistMedia { PlaylistId = id, MediaId = mediaId, Ordem = 0 });
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: /api/Playlists/{id}/remove-media?mediaId=guid
        [HttpPost("{id:guid}/remove-media")]
        public async Task<IActionResult> RemoveMediaFromPlaylist(Guid id, [FromQuery] Guid mediaId)
        {
            var item = await _context.PlaylistMedias
                .FirstOrDefaultAsync(pm => pm.PlaylistId == id && pm.MediaId == mediaId);

            if (item == null) return NotFound();

            _context.PlaylistMedias.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
