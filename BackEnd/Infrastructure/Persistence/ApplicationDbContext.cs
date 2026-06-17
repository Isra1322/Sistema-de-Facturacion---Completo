using Microsoft.EntityFrameworkCore;
using SistemaFacturacion.Domain.Entities;

namespace SistemaFacturacion.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Factura> Facturas { get; set; }
        public DbSet<DetalleFactura> DetalleFactura { get; set; }
        public DbSet<ErrorLog> ErrorLogs { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>(entity =>
{
    entity.ToTable("Usuarios");
    entity.HasKey(e => e.IdUsuario);

    entity.HasIndex(e => e.Correo)
        .IsUnique();

    entity.Property(e => e.Nombre)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(e => e.Correo)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(e => e.PasswordHash)
        .IsRequired()
        .HasMaxLength(255);

    entity.Property(e => e.Rol)
        .IsRequired()
        .HasMaxLength(30);

    entity.Property(e => e.Activo)
        .HasDefaultValue(true);

    entity.Property(e => e.IntentosFallidos)
        .HasDefaultValue(0);

    entity.Property(e => e.Bloqueado)
        .HasDefaultValue(false);
});

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(e => e.IdRole);

                entity.HasIndex(e => e.Nombre)
                    .IsUnique();

                entity.Property(e => e.Nombre)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(150);

                entity.Property(e => e.Activo)
                    .HasDefaultValue(true);
            });

            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.ToTable("Clientes");
                entity.HasKey(e => e.IdCliente);
                entity.Property(e => e.IdCliente)
                    .ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<Producto>(entity =>
            {
                entity.ToTable("Productos");
                entity.HasKey(e => e.IdProducto);

                entity.Property(e => e.Precio)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Categoria)
                    .HasMaxLength(30)
                    .HasDefaultValue("Otros");

                entity.Property(e => e.AplicaIva)
                    .HasDefaultValue(true);

                entity.Property(e => e.PorcentajeIva)
                    .HasColumnType("decimal(5,2)")
                    .HasDefaultValue(15m);
            });

            modelBuilder.Entity<Factura>(entity =>
            {
                entity.ToTable("Facturas");
                entity.HasKey(e => e.IdFactura);

                entity.HasIndex(e => e.NumeroFactura)
                    .IsUnique();

                entity.Property(e => e.Subtotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Iva)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Total)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ClienteNombreHistorico)
                    .HasMaxLength(100);

                entity.Property(e => e.ClienteApellidoHistorico)
                    .HasMaxLength(100);

                entity.Property(e => e.ClienteCorreoHistorico)
                    .HasMaxLength(100);

                entity.Property(e => e.ClienteTelefonoHistorico)
                    .HasMaxLength(30);

                entity.Property(e => e.ClienteDireccionHistorico)
                    .HasMaxLength(200);

                entity.Property(e => e.VendedorNombreHistorico)
                    .HasMaxLength(100);

                entity.Property(e => e.VendedorCorreoHistorico)
                    .HasMaxLength(100);

                entity.Property(e => e.VendedorRolHistorico)
                    .HasMaxLength(30);

                entity.HasOne(e => e.Cliente)
                    .WithMany(c => c.Facturas)
                    .HasForeignKey(e => e.IdCliente);

                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.IdUsuario)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<DetalleFactura>(entity =>
            {
                entity.ToTable("DetalleFactura");
                entity.HasKey(e => e.IdDetalleFactura);

                entity.Property(e => e.PrecioUnitario)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.PorcentajeIva)
                    .HasColumnType("decimal(5,2)");

                entity.Property(e => e.IvaLinea)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.TotalLinea)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ProductoNombreHistorico)
                    .HasMaxLength(150);

                entity.Property(e => e.ProductoCategoriaHistorico)
                    .HasMaxLength(30);

                entity.Property(e => e.ProductoPrecioUnitarioHistorico)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.ProductoPorcentajeIvaHistorico)
                    .HasColumnType("decimal(5,2)");

                entity.HasOne(e => e.Factura)
                    .WithMany(f => f.DetallesFactura)
                    .HasForeignKey(e => e.IdFactura);

                entity.HasOne(e => e.Producto)
                    .WithMany(p => p.DetallesFactura)
                    .HasForeignKey(e => e.IdProducto);
            });

            modelBuilder.Entity<ErrorLog>(entity =>
            {
                entity.ToTable("ErrorLogs");
                entity.HasKey(e => e.IdErrorLog);

                entity.Property(e => e.Fecha)
                    .IsRequired();

                entity.Property(e => e.Nivel)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Mensaje)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Ruta)
                    .HasMaxLength(300);

                entity.Property(e => e.MetodoHttp)
                    .HasMaxLength(20);

                entity.Property(e => e.Usuario)
                    .HasMaxLength(150);
            });

            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.ToTable("StockMovements");
                entity.HasKey(e => e.IdStockMovement);

                entity.Property(e => e.TipoMovimiento)
                    .IsRequired()
                    .HasMaxLength(30);

                entity.Property(e => e.Fecha)
                    .IsRequired();

                entity.Property(e => e.Motivo)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasOne(e => e.Producto)
                    .WithMany()
                    .HasForeignKey(e => e.IdProducto);

                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.IdUsuario)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
