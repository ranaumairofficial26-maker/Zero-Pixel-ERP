using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZerpPixelsCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityHashingColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS account_number_hash VARCHAR(64);");
            migrationBuilder.Sql(
                "ALTER TABLE supplier_payments ADD COLUMN IF NOT EXISTS payment_account_hash VARCHAR(64);");
            migrationBuilder.Sql(
                "ALTER TABLE supplier_payments ADD COLUMN IF NOT EXISTS record_integrity_hash VARCHAR(64);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE suppliers DROP COLUMN IF EXISTS account_number_hash;");
            migrationBuilder.Sql(
                "ALTER TABLE supplier_payments DROP COLUMN IF EXISTS payment_account_hash;");
            migrationBuilder.Sql(
                "ALTER TABLE supplier_payments DROP COLUMN IF EXISTS record_integrity_hash;");
        }
    }
}
