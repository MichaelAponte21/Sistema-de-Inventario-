package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record VentaResponse(
    Integer id,
    OffsetDateTime fecha,
    BigDecimal total,
    BigDecimal montoPagado,
    BigDecimal cambio,
    String metodoPago,
    Long usuarioId,
    String usuarioEmail,
    Integer arqueoId,
    List<DetalleVentaResponse> detalles
) {
    public record DetalleVentaResponse(
        Integer id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
    ) {}
}
