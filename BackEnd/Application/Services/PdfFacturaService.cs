using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SistemaFacturacion.Application.DTOs;
using SistemaFacturacion.Application.Interfaces;

namespace SistemaFacturacion.Application.Services
{
    public class PdfFacturaService : IPdfFacturaService
    {
        private const string BorderColor = "#4B5563";
        private const string LightBorderColor = "#D1D5DB";
        private const string TextColor = "#111827";
        private const string MutedTextColor = "#4B5563";

        public byte[] GenerarPdf(FacturaResponseDto factura)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "logo-fis.png");
            byte[]? logoBytes = File.Exists(logoPath)
                ? File.ReadAllBytes(logoPath)
                : null;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(32);
                    page.PageColor(Colors.White);

                    page.DefaultTextStyle(x =>
                        x.FontSize(9.5f)
                         .FontFamily("Arial")
                         .FontColor(TextColor));

                    page.Header().Element(header => ComposeHeader(header, factura, logoBytes));

                    page.Content()
                        .PaddingTop(20)
                        .Column(column =>
                        {
                            column.Spacing(16);

                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Element(section => ComposeClientSection(section, factura));
                                row.ConstantItem(16);
                                row.RelativeItem().Element(section => ComposeSellerSection(section, factura));
                            });
                            column.Item().Element(section => ComposeDetailSection(section, factura));
                            column.Item().Element(section => ComposeSummarySection(section, factura));
                        });

                    page.Footer()
                        .PaddingTop(10)
                        .Column(footer =>
                        {
                            footer.Item()
                                .LineHorizontal(0.75f)
                                .LineColor(LightBorderColor);

                            footer.Item()
                                .PaddingTop(6)
                                .AlignCenter()
                                .Text("UTA Tech - Documento generado por el sistema")
                                .FontSize(8.5f)
                                .FontColor(MutedTextColor);
                        });
                });
            }).GeneratePdf();

            return pdf;
        }

        private static void ComposeHeader(IContainer container, FacturaResponseDto factura, byte[]? logoBytes)
        {
            container.Column(header =>
            {
                header.Item().Row(row =>
                {
                    row.RelativeItem().Row(company =>
                    {
                        company.ConstantItem(78)
                            .Height(78)
                            .AlignMiddle()
                            .AlignCenter()
                            .Element(logo =>
                            {
                                if (logoBytes != null)
                                {
                                    logo.Image(logoBytes, ImageScaling.FitArea);
                                    return;
                                }

                                logo.Border(0.75f)
                                    .BorderColor(BorderColor)
                                    .AlignCenter()
                                    .AlignMiddle()
                                    .Text("LOGO")
                                    .FontSize(9)
                                    .Bold();
                            });

                        company.RelativeItem()
                            .PaddingLeft(14)
                            .AlignMiddle()
                            .Column(info =>
                            {
                                info.Spacing(3);

                                info.Item()
                                    .Text("UTA Tech")
                                    .FontSize(18)
                                    .Bold();

                                info.Item()
                                    .Text("Sistema de Facturación")
                                    .FontSize(10.5f);

                                info.Item()
                                    .PaddingTop(3)
                                    .Text(text =>
                                    {
                                        text.Span("Dirección: ").Bold();
                                        text.Span("Av. Los Chasquis y Río Payamino, Huachi - Ambato");
                                    });

                                info.Item().Text(text =>
                                {
                                    text.Span("Teléfono: ").Bold();
                                    text.Span("0939579158");
                                });

                                info.Item().Text(text =>
                                {
                                    text.Span("RUC: ").Bold();
                                    text.Span("9999999999001");
                                });
                            });
                    });

                    row.ConstantItem(170)
                        .Border(0.75f)
                        .BorderColor(BorderColor)
                        .Padding(10)
                        .Column(invoice =>
                        {
                            invoice.Spacing(7);

                            invoice.Item()
                                .AlignCenter()
                                .Text("FACTURA")
                                .FontSize(16)
                                .Bold();

                            invoice.Item()
                                .LineHorizontal(0.75f)
                                .LineColor(LightBorderColor);

                            invoice.Item().Text(text =>
                            {
                                text.Span("N°: ").Bold();
                                text.Span(factura.NumeroFactura.ToString());
                            });

                            invoice.Item().Text(text =>
                            {
                                text.Span("Fecha: ").Bold();
                                text.Span($"{factura.Fecha:dd/MM/yyyy}");
                            });

                            invoice.Item().Text(text =>
                            {
                                text.Span("Hora: ").Bold();
                                text.Span($"{factura.Fecha:HH:mm}");
                            });
                        });
                });

                header.Item()
                    .PaddingTop(16)
                    .LineHorizontal(0.75f)
                    .LineColor(BorderColor);
            });
        }

        private static void ComposeClientSection(IContainer container, FacturaResponseDto factura)
        {
            container
                .Border(0.75f)
                .BorderColor(BorderColor)
                .Padding(12)
                .Column(section =>
                {
                    section.Spacing(7);

                    section.Item()
                        .Text("DATOS DEL CLIENTE")
                        .FontSize(11)
                        .Bold();

                    section.Item()
                        .LineHorizontal(0.75f)
                        .LineColor(LightBorderColor);

                    section.Item().Text(text =>
                    {
                        text.Span("ID Cliente: ").Bold();
                        text.Span(factura.IdCliente.ToString());
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Cliente: ").Bold();
                        text.Span(factura.Cliente);
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Correo: ").Bold();
                        text.Span(factura.Correo);
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Teléfono: ").Bold();
                        text.Span(factura.Telefono);
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Dirección: ").Bold();
                        text.Span(factura.Direccion);
                    });
                });
        }

        private static void ComposeSellerSection(IContainer container, FacturaResponseDto factura)
        {
            container
                .Border(0.75f)
                .BorderColor(BorderColor)
                .Padding(12)
                .Column(section =>
                {
                    section.Spacing(7);

                    section.Item()
                        .Text("DATOS DEL VENDEDOR")
                        .FontSize(11)
                        .Bold();

                    section.Item()
                        .LineHorizontal(0.75f)
                        .LineColor(LightBorderColor);

                    section.Item().Text(text =>
                    {
                        text.Span("Nombre: ").Bold();
                        text.Span(ValorDisponible(factura.VendedorNombre));
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Correo: ").Bold();
                        text.Span(ValorDisponible(factura.VendedorCorreo));
                    });

                    section.Item().Text(text =>
                    {
                        text.Span("Rol: ").Bold();
                        text.Span(ValorDisponible(factura.VendedorRol));
                    });
                });
        }

        private static void ComposeDetailSection(IContainer container, FacturaResponseDto factura)
        {
            container.Column(section =>
            {
                section.Spacing(8);

                section.Item()
                    .Text("DETALLE DE PRODUCTOS")
                    .FontSize(11)
                    .Bold();

                section.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(1.1f);
                        columns.RelativeColumn(4.1f);
                        columns.RelativeColumn(1.8f);
                        columns.RelativeColumn(2f);
                        columns.RelativeColumn(2.1f);
                        columns.RelativeColumn(2.4f);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCellStyle).Text("ID").Bold();
                        header.Cell().Element(HeaderCellStyle).Text("Producto").Bold();
                        header.Cell().Element(HeaderCellStyle).AlignLeft().Text("Cantidad").Bold();
                        header.Cell().Element(HeaderCellStyle).AlignLeft().Text("Precio Unit.").Bold();
                        header.Cell().Element(HeaderCellStyle).AlignLeft().Text("Subtotal").Bold();
                        header.Cell().Element(HeaderCellStyle).AlignLeft().Text("Subtotal con IVA").Bold();
                    });

                    foreach (var detalle in factura.Detalles)
                    {
                        var subtotalLinea = detalle.PrecioUnitario * detalle.Cantidad;

                        table.Cell()
                            .Element(BodyCellStyle)
                            .Text(detalle.IdProducto.ToString());

                        table.Cell()
                            .Element(BodyCellStyle)
                            .Text(detalle.Producto);

                        table.Cell()
                            .Element(BodyCellStyle)
                            .AlignRight()
                            .Text(detalle.Cantidad.ToString());

                        table.Cell()
                            .Element(BodyCellStyle)
                            .AlignRight()
                            .Text($"{detalle.PrecioUnitario:F2}");

                        table.Cell()
                            .Element(BodyCellStyle)
                            .AlignRight()
                            .Text($"{subtotalLinea:F2}");

                        table.Cell()
                            .Element(BodyCellStyle)
                            .AlignRight()
                            .Text($"{detalle.TotalLinea:F2}");
                    }
                });
            });
        }

        private static void ComposeSummarySection(IContainer container, FacturaResponseDto factura)
        {
            container
                .AlignRight()
                .Width(235)
                .Border(0.75f)
                .BorderColor(BorderColor)
                .Padding(12)
                .Column(summary =>
                {
                    summary.Spacing(8);

                    summary.Item()
                        .Text("RESUMEN")
                        .FontSize(11)
                        .Bold();

                    summary.Item()
                        .LineHorizontal(0.75f)
                        .LineColor(LightBorderColor);

                    summary.Item().Element(row =>
                        ComposeMoneyRow(row, "Subtotal", $"${factura.Subtotal:F2}", false));

                    summary.Item().Element(row =>
                        ComposeMoneyRow(row, "IVA", $"${factura.Iva:F2}", false));

                    summary.Item()
                        .LineHorizontal(0.75f)
                        .LineColor(BorderColor);

                    summary.Item().Row(row =>
                    {
                        row.RelativeItem()
                            .Text("TOTAL")
                            .FontSize(12.5f)
                            .Bold();

                        row.ConstantItem(95)
                            .AlignRight()
                            .Text($"${factura.Total:F2}")
                            .FontSize(12.5f)
                            .Bold();
                    });
                });
        }

        private static void ComposeMoneyRow(IContainer container, string label, string value, bool bold)
        {
            container.Row(row =>
            {
                var labelText = row.RelativeItem().Text($"{label}:");
                var valueText = row.ConstantItem(95).AlignRight().Text(value);

                if (bold)
                {
                    labelText.Bold();
                    valueText.Bold();
                }
            });
        }

        private static string ValorDisponible(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor)
                ? "No disponible"
                : valor;
        }

        private static IContainer HeaderCellStyle(IContainer container)
        {
            return container
                .Border(0.75f)
                .BorderColor(BorderColor)
                .Background(Colors.White)
                .PaddingVertical(7)
                .PaddingHorizontal(7);
        }

        private static IContainer BodyCellStyle(IContainer container)
        {
            return container
                .BorderLeft(0.75f)
                .BorderRight(0.75f)
                .BorderBottom(0.75f)
                .BorderColor(LightBorderColor)
                .PaddingVertical(7)
                .PaddingHorizontal(7);
        }
    }
}
