using MediaPlayer.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaPlayer.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Media> Medias { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistMedia> PlaylistMedias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PlaylistMedia>()
                .HasKey(pm => new { pm.PlaylistId, pm.MediaId });

            modelBuilder.Entity<PlaylistMedia>()
                .HasOne(pm => pm.Playlist)
                .WithMany(p => p.PlaylistMedias)
                .HasForeignKey(pm => pm.PlaylistId);

            modelBuilder.Entity<PlaylistMedia>()
                .HasOne(pm => pm.Media)
                .WithMany()
                .HasForeignKey(pm => pm.MediaId);
        }
    }
}
