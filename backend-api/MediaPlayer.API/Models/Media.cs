namespace MediaPlayer.API.Models
{
    public class Media
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public string UrlArquivo { get; set; }
        public string Tipo { get; set; }
    }
}
