using MediaPlayer.API.Data;
using MediaPlayer.API.DTOs;
using MediaPlayer.API.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediaPlayer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MediaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/media
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Media>>> GetMedias()
        {
            return await _context.Medias.ToListAsync();
        }

        // GET: api/media/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Media>> GetMedia(Guid id)
        {
            var media = await _context.Medias.FindAsync(id);
            if (media == null) return NotFound();
            return media;
        }

        // POST: api/media
        [HttpPost]
        public async Task<ActionResult<Media>> CreateMedia(Media media)
        {
            // Se quiser garantir que vem com Id (ou deixar o banco gerar com NEWID()):
            if (media.Id == Guid.Empty) media.Id = Guid.NewGuid();

            _context.Medias.Add(media);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMedia), new { id = media.Id }, media);
        }

        // POST: api/media/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] UploadMediaDto dto)
        {
            var file = dto.File;

            if (file == null || file.Length == 0)
                return BadRequest("Arquivo inválido.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fileUrl = $"{baseUrl}/uploads/{fileName}";

            var media = new Media
            {
                Id = Guid.NewGuid(),
                Nome = Path.GetFileNameWithoutExtension(file.FileName),
                UrlArquivo = fileUrl
            };

            _context.Medias.Add(media);
            await _context.SaveChangesAsync();

            return Ok(media);
        }

        // PUT: api/media/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateMedia(Guid id, Media media)
        {
            if (id != media.Id) return BadRequest();

            _context.Entry(media).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Medias.AnyAsync(e => e.Id == id);
                if (!exists) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/media/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteMedia(Guid id)
        {
            var media = await _context.Medias.FindAsync(id);
            if (media == null) return NotFound();

            _context.Medias.Remove(media);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
