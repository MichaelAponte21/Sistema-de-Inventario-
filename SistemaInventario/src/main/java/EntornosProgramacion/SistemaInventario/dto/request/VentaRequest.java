package EntornosProgramacion.SistemaInventario.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record VentaRequest(
    @NotEmpty(message = "Debe incluir al menos un producto")
    @Valid
    List<DetalleVentaRequest> items,

    @NotNull @DecimalMin("0.00")
    BigDecimal montoPagado,

    @NotBlank
    String metodoPago,

    Integer arqueoId
) {
    public record DetalleVentaRequest(
        @NotNull Long productoId,
        @NotNull @Min(1) Integer cantidad
    ) {}
}
