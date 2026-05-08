package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ResumenResponse(
    VentasStats ventasHoy,
    VentasStats ventasSemana,
    VentasStats ventasMes,
    List<VentaDiaStats> ventasUltimos7Dias,
    List<ProductoTopVentas> topProductos,
    Integer productosStockBajo,
    BigDecimal diferenciaPromedioArqueos,
    BigDecimal ingresosPorMetodo_EFECTIVO,
    BigDecimal ingresosPorMetodo_TARJETA,
    BigDecimal ingresosPorMetodo_TRANSFERENCIA
) {
    public record VentasStats(BigDecimal total, long count) {}
    public record VentaDiaStats(String fecha, BigDecimal total, long count) {}
    public record ProductoTopVentas(Long productoId, String nombre, int unidades, BigDecimal ingresos) {}
}
