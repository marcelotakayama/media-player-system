namespace MediaPlayer.API.Models
{
    public class PlaylistMedia
    {
        public Guid PlaylistId { get; set; }
        public Playlist Playlist { get; set; }
        public Guid MediaId { get; set; }
        public Media Media { get; set; }

        public int Ordem { get; set; }
    }
}
