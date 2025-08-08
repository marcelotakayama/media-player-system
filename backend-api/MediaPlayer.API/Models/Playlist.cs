namespace MediaPlayer.API.Models
{
    public class Playlist
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nome { get; set; }
        public bool ExibirNoPlayer { get; set; }

        public ICollection<PlaylistMedia> PlaylistMedias { get; set; } = new List<PlaylistMedia>();
    }
}
