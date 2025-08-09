using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaPlayer.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDescricaoToPlaylist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Playlists",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Playlists");
        }
    }
}
