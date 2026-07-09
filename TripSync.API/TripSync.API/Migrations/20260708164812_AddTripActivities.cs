using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTripActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TripActivities_Users_UserId",
                table: "TripActivities");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "TripActivities");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "TripActivities",
                newName: "ActorUserId");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "TripActivities",
                newName: "Message");

            migrationBuilder.RenameIndex(
                name: "IX_TripActivities_UserId",
                table: "TripActivities",
                newName: "IX_TripActivities_ActorUserId");

            migrationBuilder.Sql(
                """
                ALTER TABLE "TripActivities"
                ALTER COLUMN "Type" TYPE text
                USING "Type"::text;
                """);

            migrationBuilder.AddColumn<string>(
                name: "ActorName",
                table: "TripActivities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TargetUserId",
                table: "TripActivities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetUserName",
                table: "TripActivities",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TripActivities_TargetUserId",
                table: "TripActivities",
                column: "TargetUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TripActivities_Users_ActorUserId",
                table: "TripActivities",
                column: "ActorUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TripActivities_Users_TargetUserId",
                table: "TripActivities",
                column: "TargetUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TripActivities_Users_ActorUserId",
                table: "TripActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_TripActivities_Users_TargetUserId",
                table: "TripActivities");

            migrationBuilder.DropIndex(
                name: "IX_TripActivities_TargetUserId",
                table: "TripActivities");

            migrationBuilder.DropColumn(
                name: "ActorName",
                table: "TripActivities");

            migrationBuilder.DropColumn(
                name: "TargetUserId",
                table: "TripActivities");

            migrationBuilder.DropColumn(
                name: "TargetUserName",
                table: "TripActivities");

            migrationBuilder.Sql(
                """
                ALTER TABLE "TripActivities"
                ALTER COLUMN "Type" TYPE integer
                USING CASE
                    WHEN "Type" ~ '^[0-9]+$' THEN "Type"::integer
                    ELSE 0
                END;
                """);

            migrationBuilder.RenameColumn(
                name: "ActorUserId",
                table: "TripActivities",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "TripActivities",
                newName: "Description");

            migrationBuilder.RenameIndex(
                name: "IX_TripActivities_ActorUserId",
                table: "TripActivities",
                newName: "IX_TripActivities_UserId");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "TripActivities",
                type: "text",
                nullable: false,
                defaultValue: string.Empty);

            migrationBuilder.AddForeignKey(
                name: "FK_TripActivities_Users_UserId",
                table: "TripActivities",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
