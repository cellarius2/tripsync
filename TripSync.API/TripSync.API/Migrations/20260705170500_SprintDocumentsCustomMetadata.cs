using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripSync.API.Migrations
{
    /// <inheritdoc />
    public partial class SprintDocumentsCustomMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "TripDocuments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "TripDocuments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "TripDocuments",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "TripDocuments",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "TripType",
                table: "TripDocuments",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "TripDocuments");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "TripDocuments");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "TripDocuments");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "TripDocuments");

            migrationBuilder.DropColumn(
                name: "TripType",
                table: "TripDocuments");
        }
    }
}
