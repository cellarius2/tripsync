using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripSync.API.Migrations
{
    public partial class Sprint4Checklist : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migration intencionalmente vazia.
            // As colunas ParticipantsCount, UpdatedAt e IsActive já estão sincronizadas no banco.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Migration intencionalmente vazia para evitar remover colunas já usadas pelo sistema.
        }
    }
}