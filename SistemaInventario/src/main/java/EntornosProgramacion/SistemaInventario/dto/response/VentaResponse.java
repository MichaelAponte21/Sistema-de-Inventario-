package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record VentaResponse(
    Long id,
    OffsetDateTime fecha,
    BigDecimal total,
    BigDecimal montoPagado,
    BigDecimal cambio,
    String metodoPago,
    String estado,
    Long usuarioId,
    String usuarioEmail,
    Long arqueoId,
    List<DetalleVentaResponse> detalles
) {
    public record DetalleVentaResponse(
        Long id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
    ) {}
}
