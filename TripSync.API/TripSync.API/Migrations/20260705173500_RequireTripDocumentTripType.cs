using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripSync.API.Migrations
{
    /// <inheritdoc />
    public partial class RequireTripDocumentTripType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "TripDocuments" AS d
                SET "TripType" = t."Type"
                FROM "TripParticipants" AS p
                INNER JOIN "Trips" AS t ON t."Id" = p."TripId"
                WHERE d."TripParticipantId" = p."Id"
                  AND d."TripType" IS NULL;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "TripType",
                table: "TripDocuments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TripType",
                table: "TripDocuments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
