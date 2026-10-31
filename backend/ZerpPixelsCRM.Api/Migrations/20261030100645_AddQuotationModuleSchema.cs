using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZerpPixelsCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotationModuleSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "quotations",
                columns: table => new
                {
                    quotation_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    quotation_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    client_id = table.Column<long>(type: "bigint", nullable: true),
                    customer_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    contact_person = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    customer_phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    customer_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    customer_address = table.Column<string>(type: "text", nullable: true),
                    quotation_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Printing"),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "PKR"),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotations", x => x.quotation_id);
                });

            migrationBuilder.CreateTable(
                name: "quotation_revisions",
                columns: table => new
                {
                    revision_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    quotation_id = table.Column<long>(type: "bigint", nullable: false),
                    revision_number = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Draft"),
                    quotation_date = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    valid_until = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "None"),
                    discount_value = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0m),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0m),
                    tax_rate = table.Column<decimal>(type: "numeric(8,4)", nullable: false, defaultValue: 0m),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0m),
                    grand_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    internal_notes = table.Column<string>(type: "text", nullable: true),
                    customer_notes = table.Column<string>(type: "text", nullable: true),
                    terms_and_conditions = table.Column<string>(type: "text", nullable: true),
                    finalized_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotation_revisions", x => x.revision_id);
                    table.ForeignKey(
                        name: "FK_quotation_revisions_quotations_quotation_id",
                        column: x => x.quotation_id,
                        principalTable: "quotations",
                        principalColumn: "quotation_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quotation_approval_logs",
                columns: table => new
                {
                    approval_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    revision_id = table.Column<long>(type: "bigint", nullable: false),
                    decision = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    response_method = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    contact_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    response_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotation_approval_logs", x => x.approval_id);
                    table.ForeignKey(
                        name: "FK_quotation_approval_logs_quotation_revisions_revision_id",
                        column: x => x.revision_id,
                        principalTable: "quotation_revisions",
                        principalColumn: "revision_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quotation_items",
                columns: table => new
                {
                    item_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    revision_id = table.Column<long>(type: "bigint", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    item_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Printing"),
                    product_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    size_dimensions = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    material = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    gsm = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    printing_color = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    finishing = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", nullable: false, defaultValue: 1m),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "pcs"),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotation_items", x => x.item_id);
                    table.ForeignKey(
                        name: "FK_quotation_items_quotation_revisions_revision_id",
                        column: x => x.revision_id,
                        principalTable: "quotation_revisions",
                        principalColumn: "revision_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quotation_send_logs",
                columns: table => new
                {
                    send_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    revision_id = table.Column<long>(type: "bigint", nullable: false),
                    send_method = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    recipient = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    marked_sent_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotation_send_logs", x => x.send_id);
                    table.ForeignKey(
                        name: "FK_quotation_send_logs_quotation_revisions_revision_id",
                        column: x => x.revision_id,
                        principalTable: "quotation_revisions",
                        principalColumn: "revision_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_quotation_approval_logs_revision_id",
                table: "quotation_approval_logs",
                column: "revision_id");

            migrationBuilder.CreateIndex(
                name: "IX_quotation_items_revision_id",
                table: "quotation_items",
                column: "revision_id");

            migrationBuilder.CreateIndex(
                name: "IX_quotation_revisions_date",
                table: "quotation_revisions",
                column: "quotation_date");

            migrationBuilder.CreateIndex(
                name: "IX_quotation_revisions_quotation_id",
                table: "quotation_revisions",
                column: "quotation_id");

            migrationBuilder.CreateIndex(
                name: "IX_quotation_revisions_quote_rev",
                table: "quotation_revisions",
                columns: new[] { "quotation_id", "revision_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_quotation_revisions_status",
                table: "quotation_revisions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_quotation_send_logs_revision_id",
                table: "quotation_send_logs",
                column: "revision_id");

            migrationBuilder.CreateIndex(
                name: "IX_quotations_client_id",
                table: "quotations",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_quotations_customer_name",
                table: "quotations",
                column: "customer_name");

            migrationBuilder.CreateIndex(
                name: "IX_quotations_deleted_at",
                table: "quotations",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_quotations_quotation_number",
                table: "quotations",
                column: "quotation_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "quotation_approval_logs");

            migrationBuilder.DropTable(
                name: "quotation_items");

            migrationBuilder.DropTable(
                name: "quotation_send_logs");

            migrationBuilder.DropTable(
                name: "quotation_revisions");

            migrationBuilder.DropTable(
                name: "quotations");
        }
    }
}
