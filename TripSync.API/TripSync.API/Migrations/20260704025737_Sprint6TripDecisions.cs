using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripSync.API.Migrations
{
    /// <inheritdoc />
    public partial class Sprint6TripDecisions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChecklistItems_TripParticipants_AssignedToParticipantId",
                table: "ChecklistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_TripParticipants_PaidByParticipantId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_CreatedById",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_VotePolls_Users_CreatedById",
                table: "VotePolls");

            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Votes_VotePollId_UserId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Trips_InviteCode",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_TripParticipants_TripId_UserId",
                table: "TripParticipants");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "VotePolls",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(160)",
                oldMaxLength: 160);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "VoteOptions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(160)",
                oldMaxLength: 160);

            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedTotalCost",
                table: "Trips",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldPrecision: 12,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountSaved",
                table: "TripParticipants",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldPrecision: 12,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Expenses",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldPrecision: 12,
                oldScale: 2);

            migrationBuilder.CreateTable(
                name: "TripDecisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    SelectedOptionTitle = table.Column<string>(type: "text", nullable: false),
                    SourcePollId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripDecisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TripDecisions_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TripDecisions_VotePolls_SourcePollId",
                        column: x => x.SourcePollId,
                        principalTable: "VotePolls",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Votes_VotePollId",
                table: "Votes",
                column: "VotePollId");

            migrationBuilder.CreateIndex(
                name: "IX_TripParticipants_TripId",
                table: "TripParticipants",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_TripDecisions_SourcePollId",
                table: "TripDecisions",
                column: "SourcePollId");

            migrationBuilder.CreateIndex(
                name: "IX_TripDecisions_TripId",
                table: "TripDecisions",
                column: "TripId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistItems_TripParticipants_AssignedToParticipantId",
                table: "ChecklistItems",
                column: "AssignedToParticipantId",
                principalTable: "TripParticipants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_TripParticipants_PaidByParticipantId",
                table: "Expenses",
                column: "PaidByParticipantId",
                principalTable: "TripParticipants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_CreatedById",
                table: "Trips",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_VotePolls_Users_CreatedById",
                table: "VotePolls",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChecklistItems_TripParticipants_AssignedToParticipantId",
                table: "ChecklistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_TripParticipants_PaidByParticipantId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_CreatedById",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_VotePolls_Users_CreatedById",
                table: "VotePolls");

            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes");

            migrationBuilder.DropTable(
                name: "TripDecisions");

            migrationBuilder.DropIndex(
                name: "IX_Votes_VotePollId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_TripParticipants_TripId",
                table: "TripParticipants");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "VotePolls",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "VoteOptions",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedTotalCost",
                table: "Trips",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountSaved",
                table: "TripParticipants",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Expenses",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_VotePollId_UserId",
                table: "Votes",
                columns: new[] { "VotePollId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_InviteCode",
                table: "Trips",
                column: "InviteCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TripParticipants_TripId_UserId",
                table: "TripParticipants",
                columns: new[] { "TripId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistItems_TripParticipants_AssignedToParticipantId",
                table: "ChecklistItems",
                column: "AssignedToParticipantId",
                principalTable: "TripParticipants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_TripParticipants_PaidByParticipantId",
                table: "Expenses",
                column: "PaidByParticipantId",
                principalTable: "TripParticipants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_CreatedById",
                table: "Trips",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VotePolls_Users_CreatedById",
                table: "VotePolls",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Users_UserId",
                table: "Votes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
